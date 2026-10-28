import { describe, expect, it } from 'vitest';
import type { Task } from '../data/tasks';
import { moveTask } from './taskList';

const task = (id: string, routine: Task['routine'], enabled?: boolean): Task => ({
  id,
  title: id.toUpperCase(),
  routine,
  required: false,
  ...(enabled === undefined ? {} : { enabled }),
});

const ids = (list: Task[]) => list.map((t) => t.id);

describe('moveTask', () => {
  const list = [task('a', 'morning'), task('b', 'morning'), task('c', 'morning')];

  it('moves a task up', () => {
    expect(ids(moveTask(list, 'b', 'up'))).toEqual(['b', 'a', 'c']);
  });

  it('moves a task down', () => {
    expect(ids(moveTask(list, 'b', 'down'))).toEqual(['a', 'c', 'b']);
  });

  it('does not move the first task up or the last task down', () => {
    expect(moveTask(list, 'a', 'up')).toBe(list);
    expect(moveTask(list, 'c', 'down')).toBe(list);
  });

  it('ignores an unknown id', () => {
    expect(moveTask(list, 'zzz', 'up')).toBe(list);
  });

  it('does not mutate the input', () => {
    moveTask(list, 'b', 'up');
    expect(ids(list)).toEqual(['a', 'b', 'c']);
  });

  it('skips tasks of the other routine in between', () => {
    const mixed = [
      task('m1', 'morning'),
      task('e1', 'evening'),
      task('e2', 'evening'),
      task('m2', 'morning'),
    ];
    expect(ids(moveTask(mixed, 'm2', 'up'))).toEqual(['m2', 'e1', 'e2', 'm1']);
    expect(ids(moveTask(mixed, 'm1', 'down'))).toEqual(['m2', 'e1', 'e2', 'm1']);
  });

  it('never moves a task across routines', () => {
    const mixed = [task('m1', 'morning'), task('e1', 'evening'), task('e2', 'evening')];
    expect(moveTask(mixed, 'm1', 'down')).toBe(mixed);
    expect(moveTask(mixed, 'e1', 'up')).toBe(mixed);
    expect(ids(moveTask(mixed, 'e1', 'down'))).toEqual(['m1', 'e2', 'e1']);
  });

  it('keeps the relative order of the other routine unchanged', () => {
    const mixed = [
      task('e1', 'evening'),
      task('m1', 'morning'),
      task('e2', 'evening'),
      task('m2', 'morning'),
      task('e3', 'evening'),
    ];
    const next = moveTask(mixed, 'm2', 'up');
    expect(ids(next.filter((t) => t.routine === 'evening'))).toEqual(['e1', 'e2', 'e3']);
    expect(ids(next.filter((t) => t.routine === 'morning'))).toEqual(['m2', 'm1']);
  });

  it('moves disabled tasks too and keeps their flag', () => {
    const withOff = [task('a', 'morning'), task('b', 'morning', false)];
    const next = moveTask(withOff, 'b', 'up');
    expect(ids(next)).toEqual(['b', 'a']);
    expect(next[0].enabled).toBe(false);
  });
});
