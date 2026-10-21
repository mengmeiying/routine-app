import { emptyProgress, type DayProgress } from './queue';

export type History = Record<string, DayProgress>;

const STORAGE_KEY = 'routine-app:history';

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === 'string');

const isDayProgress = (value: unknown): value is DayProgress => {
  if (typeof value !== 'object' || value === null) return false;
  const { done, postponed } = value as Record<string, unknown>;
  return isStringArray(done) && isStringArray(postponed);
};

// Never throws: corrupt data or unavailable storage yields an empty history.
export function loadHistory(): History {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    const history: History = {};
    for (const [date, progress] of Object.entries(parsed)) {
      if (isDayProgress(progress)) history[date] = progress;
    }
    return history;
  } catch {
    return {};
  }
}

// A new logical date has no entry yet, which is what resets marks at 06:00.
export function loadProgress(date: string): DayProgress {
  return loadHistory()[date] ?? emptyProgress;
}

export function saveProgress(date: string, progress: DayProgress): void {
  try {
    const history = { ...loadHistory(), [date]: progress };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Write failures (quota, private mode) must not break the UI.
  }
}
