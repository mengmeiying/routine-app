import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { emptyProgress } from './queue';
import { loadHistory, loadProgress, saveProgress } from './storage';

const KEY = 'routine-app:history';

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

describe('loadProgress', () => {
  it('returns empty progress for empty storage', () => {
    expect(loadProgress('2026-10-21')).toEqual(emptyProgress);
  });

  it('returns what was saved', () => {
    const progress = { done: ['a'], postponed: ['b'] };
    saveProgress('2026-10-21', progress);
    expect(loadProgress('2026-10-21')).toEqual(progress);
  });

  it('returns empty progress for a new logical date and keeps the old one', () => {
    const progress = { done: ['a'], postponed: [] };
    saveProgress('2026-10-21', progress);
    expect(loadProgress('2026-10-22')).toEqual(emptyProgress);
    expect(loadProgress('2026-10-21')).toEqual(progress);
  });
});

describe('saveProgress', () => {
  it('does not overwrite other dates', () => {
    saveProgress('2026-10-20', { done: ['a'], postponed: [] });
    saveProgress('2026-10-21', { done: ['b'], postponed: [] });
    expect(loadHistory()).toEqual({
      '2026-10-20': { done: ['a'], postponed: [] },
      '2026-10-21': { done: ['b'], postponed: [] },
    });
  });
});

describe('corrupt or unavailable storage', () => {
  it('ignores invalid JSON', () => {
    stubStorage({ [KEY]: '{not json' });
    expect(loadHistory()).toEqual({});
  });

  it('ignores data of the wrong shape', () => {
    stubStorage({ [KEY]: '[1, 2]' });
    expect(loadHistory()).toEqual({});
  });

  it('drops malformed entries but keeps valid ones', () => {
    stubStorage({
      [KEY]: JSON.stringify({
        '2026-10-20': { done: 'a', postponed: [] },
        '2026-10-21': { done: ['a'], postponed: [] },
      }),
    });
    expect(loadHistory()).toEqual({ '2026-10-21': { done: ['a'], postponed: [] } });
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
    expect(loadProgress('2026-10-21')).toEqual(emptyProgress);
    expect(() => saveProgress('2026-10-21', emptyProgress)).not.toThrow();
  });
});
