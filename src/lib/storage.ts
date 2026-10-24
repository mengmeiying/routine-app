import { tasks as defaultTasks, type Task } from '../data/tasks';
import { emptyProgress, type DayProgress } from './queue';

export type History = Record<string, DayProgress>;

const STORAGE_KEY = 'routine-app:history';
const TASKS_KEY = 'routine-app:tasks';
export const TASKS_FORMAT_VERSION = 1;

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

const isTask = (value: unknown): value is Task => {
  if (typeof value !== 'object' || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    (t.routine === 'morning' || t.routine === 'evening') &&
    typeof t.required === 'boolean' &&
    (t.enabled === undefined || typeof t.enabled === 'boolean')
  );
};

// Brings saved data of any known format version up to the current one and returns
// its raw task entries, or null when the version is unknown or the data is unusable.
function migrateTasks(parsed: unknown): unknown[] | null {
  if (typeof parsed !== 'object' || parsed === null) return null;
  const { version, tasks } = parsed as Record<string, unknown>;
  if (version === 1 && Array.isArray(tasks)) return tasks;
  return null;
}

// Falls back to the starter list until the user saves their own. Skips malformed
// entries and duplicate ids. Never throws.
export function loadTasks(defaults: Task[] = defaultTasks): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (raw === null) return defaults;
    const entries = migrateTasks(JSON.parse(raw));
    if (entries === null) return defaults;
    const seen = new Set<string>();
    return entries.filter((entry): entry is Task => {
      if (!isTask(entry) || seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    });
  } catch {
    return defaults;
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(
      TASKS_KEY,
      JSON.stringify({ version: TASKS_FORMAT_VERSION, tasks }),
    );
  } catch {
    // Write failures (quota, private mode) must not break the UI.
  }
}

// Asks the browser not to evict our data under storage pressure.
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
