import type { Task } from '../data/tasks';
import type { RoutineKind } from './routine';

export const MAX_TITLE_LENGTH = 60;

// Returns the trimmed title, or null when it is empty or too long.
export function normalizeTitle(raw: string): string | null {
  const title = raw.trim();
  if (title === '' || title.length > MAX_TITLE_LENGTH) return null;
  return title;
}

export function createTaskId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

type NewTask = { id: string; title: string; routine: RoutineKind; required: boolean };

// The functions below return the same array when nothing changes, and never mutate.
export function addTask(tasks: Task[], input: NewTask): Task[] {
  const title = normalizeTitle(input.title);
  if (title === null || tasks.some((t) => t.id === input.id)) return tasks;
  return [
    ...tasks,
    { id: input.id, title, routine: input.routine, required: input.required },
  ];
}

export function renameTask(tasks: Task[], id: string, rawTitle: string): Task[] {
  const title = normalizeTitle(rawTitle);
  if (title === null) return tasks;
  return tasks.map((t) => (t.id === id ? { ...t, title } : t));
}

export function removeTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((t) => t.id !== id);
}

export type MoveDirection = 'up' | 'down';

// Swaps the task with its nearest neighbour of the same routine. Tasks of the other
// routine in between are skipped, so a task never crosses to the other routine.
export function moveTask(tasks: Task[], id: string, direction: MoveDirection): Task[] {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return tasks;

  const step = direction === 'up' ? -1 : 1;
  const { routine } = tasks[index];
  let neighbour = index + step;
  while (tasks[neighbour] !== undefined && tasks[neighbour].routine !== routine) {
    neighbour += step;
  }
  if (tasks[neighbour] === undefined) return tasks;

  const next = [...tasks];
  [next[index], next[neighbour]] = [next[neighbour], next[index]];
  return next;
}
