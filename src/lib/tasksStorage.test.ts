import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Task } from '../data/tasks';
import { loadHistory, loadTasks, saveTasks, TASKS_FORMAT_VERSION } from './storage';

const KEY = 'routine-app:tasks';

const defaults: Task[] = [
  { id: 'd1', title: 'Default 1', routine: 'morning', required: true },
  { id: 'd2', title: 'Default 2', routine: 'evening', required: false },
];

const saved: Task[] = [
  { id: 'b', title: 'B', routine: 'evening', required: false, enabled: false },
  { id: 'a', title: 'A', routine: 'morning', required: true },
];

function stubStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  });
  return data;
}

beforeEach(() => {
  stubStorage();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('loadTasks', () => {
  it('returns the starter list when nothing is saved, without writing it', () => {
    const data = stubStorage();
    expect(loadTasks(defaults)).toEqual(defaults);
    expect(data.has(KEY)).toBe(false);
  });

  it('returns what was saved, in the same order', () => {
    saveTasks(saved);
    expect(loadTasks(defaults)).toEqual(saved);
  });

  it('stores the format version next to the tasks', () => {
    const data = stubStorage();
    saveTasks(saved);
    expect(JSON.parse(data.get(KEY)!)).toEqual({
      version: TASKS_FORMAT_VERSION,
      tasks: saved,
    });
  });

  it('keeps an empty saved list empty', () => {
    saveTasks([]);
    expect(loadTasks(defaults)).toEqual([]);
  });

  it.each([
    ['invalid JSON', '{not json'],
    ['a bare array', JSON.stringify(saved)],
    ['an unknown version', JSON.stringify({ version: 99, tasks: saved })],
    ['a missing version', JSON.stringify({ tasks: saved })],
    ['tasks that are not an array', JSON.stringify({ version: 1, tasks: 'nope' })],
    ['null', 'null'],
  ])('falls back to the starter list for %s', (_name, raw) => {
    stubStorage({ [KEY]: raw });
    expect(loadTasks(defaults)).toEqual(defaults);
  });

  it('skips malformed entries but keeps the valid ones', () => {
    stubStorage({
      [KEY]: JSON.stringify({
        version: 1,
        tasks: [
          saved[1],
          { id: 'x', title: 'No routine', required: true },
          { id: 'y', title: 'Bad routine', routine: 'noon', required: true },
          {
            id: 'z',
            title: 'Bad enabled',
            routine: 'morning',
            required: true,
            enabled: 'yes',
          },
          'junk',
          null,
          saved[0],
        ],
      }),
    });
    expect(loadTasks(defaults)).toEqual([saved[1], saved[0]]);
  });

  it('drops duplicate ids and keeps the first one', () => {
    stubStorage({
      [KEY]: JSON.stringify({
        version: 1,
        tasks: [saved[1], { ...saved[1], title: 'Copy' }, saved[0]],
      }),
    });
    expect(loadTasks(defaults)).toEqual([saved[1], saved[0]]);
  });

  it('does not throw when localStorage throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('quota');
      },
    });
    expect(loadTasks(defaults)).toEqual(defaults);
    expect(() => saveTasks(saved)).not.toThrow();
  });
});

describe('tasks and history', () => {
  it('are stored independently', () => {
    stubStorage({
      'routine-app:history': JSON.stringify({
        '2026-10-21': { done: ['a'], postponed: [] },
      }),
    });
    saveTasks(saved);
    expect(loadHistory()).toEqual({ '2026-10-21': { done: ['a'], postponed: [] } });
  });
});
