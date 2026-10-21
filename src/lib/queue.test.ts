import { describe, expect, it } from 'vitest';
import type { Task } from '../data/tasks';
import {
  buildQueue,
  currentTask,
  emptyProgress,
  markDone,
  postpone,
  type DayProgress,
} from './queue';

const tasks: Task[] = [
  { id: 'a', title: 'A', routine: 'morning', required: true },
  { id: 'b', title: 'B', routine: 'morning', required: false },
  { id: 'c', title: 'C', routine: 'morning', required: false },
  { id: 'x', title: 'X', routine: 'evening', required: true },
  { id: 'off', title: 'Off', routine: 'morning', required: true, enabled: false },
];

const ids = (queue: Task[]) => queue.map((t) => t.id);

describe('buildQueue', () => {
  it('keeps array order and filters by routine', () => {
    expect(ids(buildQueue(tasks, 'morning', emptyProgress))).toEqual(['a', 'b', 'c']);
    expect(ids(buildQueue(tasks, 'evening', emptyProgress))).toEqual(['x']);
  });

  it('hides disabled tasks', () => {
    expect(ids(buildQueue(tasks, 'morning', emptyProgress))).not.toContain('off');
  });

  it('removes done tasks', () => {
    const progress: DayProgress = { done: ['a'], postponed: [] };
    expect(ids(buildQueue(tasks, 'morning', progress))).toEqual(['b', 'c']);
  });

  it('moves postponed tasks to the end in postponement order', () => {
    const progress: DayProgress = { done: [], postponed: ['b', 'a'] };
    expect(ids(buildQueue(tasks, 'morning', progress))).toEqual(['c', 'b', 'a']);
  });

  it('ignores done tasks that are also postponed', () => {
    const progress: DayProgress = { done: ['a'], postponed: ['a', 'b'] };
    expect(ids(buildQueue(tasks, 'morning', progress))).toEqual(['c', 'b']);
  });

  it('is empty when everything is done', () => {
    const progress: DayProgress = { done: ['a', 'b', 'c'], postponed: [] };
    const queue = buildQueue(tasks, 'morning', progress);
    expect(queue).toEqual([]);
    expect(currentTask(queue)).toBeUndefined();
  });
});

describe('currentTask', () => {
  it('is the first task in the queue', () => {
    expect(currentTask(buildQueue(tasks, 'morning', emptyProgress))?.id).toBe('a');
  });
});

describe('markDone', () => {
  it('adds the id and does not mutate the input', () => {
    const progress: DayProgress = { done: [], postponed: [] };
    expect(markDone(progress, 'a').done).toEqual(['a']);
    expect(progress.done).toEqual([]);
  });

  it('does not duplicate ids', () => {
    expect(markDone({ done: ['a'], postponed: [] }, 'a').done).toEqual(['a']);
  });
});

describe('postpone', () => {
  it('sends the current task to the end of the queue', () => {
    const progress = postpone(emptyProgress, 'a');
    expect(ids(buildQueue(tasks, 'morning', progress))).toEqual(['b', 'c', 'a']);
  });

  it('sends it to the end again when postponed twice', () => {
    let progress = postpone(emptyProgress, 'a');
    progress = postpone(progress, 'b');
    progress = postpone(progress, 'a');
    expect(progress.postponed).toEqual(['b', 'a']);
    expect(ids(buildQueue(tasks, 'morning', progress))).toEqual(['c', 'b', 'a']);
  });

  it('leaves the queue unchanged when the last task is postponed', () => {
    const progress = postpone(emptyProgress, 'c');
    expect(ids(buildQueue(tasks, 'morning', progress))).toEqual(['a', 'b', 'c']);
  });

  it('does not mutate the input', () => {
    const progress: DayProgress = { done: [], postponed: ['b'] };
    postpone(progress, 'a');
    expect(progress.postponed).toEqual(['b']);
  });
});
