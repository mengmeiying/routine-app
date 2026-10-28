import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Task } from '../data/tasks';
import {
  addTask,
  createTaskId,
  MAX_TITLE_LENGTH,
  normalizeTitle,
  removeTask,
  renameTask,
} from './taskList';

const tasks: Task[] = [
  { id: 'a', title: 'A', routine: 'morning', required: true },
  { id: 'b', title: 'B', routine: 'evening', required: false },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('normalizeTitle', () => {
  it('trims the title', () => {
    expect(normalizeTitle('  Душ  ')).toBe('Душ');
  });

  it('rejects empty and whitespace-only titles', () => {
    expect(normalizeTitle('')).toBeNull();
    expect(normalizeTitle('   ')).toBeNull();
  });

  it('accepts the maximum length and rejects one more', () => {
    expect(normalizeTitle('x'.repeat(MAX_TITLE_LENGTH))).not.toBeNull();
    expect(normalizeTitle('x'.repeat(MAX_TITLE_LENGTH + 1))).toBeNull();
  });
});

describe('addTask', () => {
  it('appends the task to the end with a trimmed title', () => {
    const next = addTask(tasks, {
      id: 'c',
      title: ' New ',
      routine: 'evening',
      required: true,
    });
    expect(next.map((t) => t.id)).toEqual(['a', 'b', 'c']);
    expect(next[2]).toEqual({
      id: 'c',
      title: 'New',
      routine: 'evening',
      required: true,
    });
  });

  it('does not mutate the input', () => {
    addTask(tasks, { id: 'c', title: 'New', routine: 'morning', required: false });
    expect(tasks).toHaveLength(2);
  });

  it('returns the same list for an invalid title', () => {
    const input = { id: 'c', routine: 'morning', required: false } as const;
    expect(addTask(tasks, { ...input, title: '  ' })).toBe(tasks);
    expect(addTask(tasks, { ...input, title: 'x'.repeat(61) })).toBe(tasks);
  });

  it('returns the same list when the id is already taken', () => {
    const input = {
      id: 'a',
      title: 'Copy',
      routine: 'morning',
      required: false,
    } as const;
    expect(addTask(tasks, input)).toBe(tasks);
  });

  it('allows the same title in different tasks', () => {
    const next = addTask(tasks, {
      id: 'c',
      title: 'A',
      routine: 'evening',
      required: false,
    });
    expect(next.filter((t) => t.title === 'A')).toHaveLength(2);
  });
});

describe('renameTask', () => {
  it('changes only the title of the given task', () => {
    const next = renameTask(tasks, 'a', '  Renamed ');
    expect(next[0]).toEqual({ ...tasks[0], title: 'Renamed' });
    expect(next[1]).toBe(tasks[1]);
  });

  it('keeps order and does not mutate the input', () => {
    const next = renameTask(tasks, 'b', 'Renamed');
    expect(next.map((t) => t.id)).toEqual(['a', 'b']);
    expect(tasks[1].title).toBe('B');
  });

  it('returns the same list for an invalid title', () => {
    expect(renameTask(tasks, 'a', '')).toBe(tasks);
  });

  it('leaves the list unchanged for an unknown id', () => {
    expect(renameTask(tasks, 'zzz', 'X')).toEqual(tasks);
  });
});

describe('removeTask', () => {
  it('removes the task and keeps the order of the rest', () => {
    expect(removeTask(tasks, 'a').map((t) => t.id)).toEqual(['b']);
  });

  it('does not mutate the input', () => {
    removeTask(tasks, 'a');
    expect(tasks).toHaveLength(2);
  });

  it('leaves the list unchanged for an unknown id', () => {
    expect(removeTask(tasks, 'zzz')).toEqual(tasks);
  });
});

describe('createTaskId', () => {
  it('returns different ids', () => {
    expect(createTaskId()).not.toBe(createTaskId());
  });

  it('falls back when crypto.randomUUID is unavailable', () => {
    vi.stubGlobal('crypto', undefined);
    const id = createTaskId();
    expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
    expect(createTaskId()).not.toBe(id);
  });
});
