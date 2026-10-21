import type { Task } from '../data/tasks';
import type { RoutineKind } from './routine';

export type DayProgress = { done: string[]; postponed: string[] };

export const emptyProgress: DayProgress = { done: [], postponed: [] };

// Postponed tasks go to the end, in the order they were postponed.
export function buildQueue(
  tasks: Task[],
  routine: RoutineKind,
  progress: DayProgress,
): Task[] {
  const pending = tasks.filter(
    (t) => t.routine === routine && t.enabled !== false && !progress.done.includes(t.id),
  );
  const regular = pending.filter((t) => !progress.postponed.includes(t.id));
  const postponed = progress.postponed
    .map((id) => pending.find((t) => t.id === id))
    .filter((t): t is Task => t !== undefined);
  return [...regular, ...postponed];
}

export function currentTask(queue: Task[]): Task | undefined {
  return queue[0];
}

export function markDone(progress: DayProgress, id: string): DayProgress {
  if (progress.done.includes(id)) return progress;
  return { ...progress, done: [...progress.done, id] };
}

// Re-postponing moves the task to the end again.
export function postpone(progress: DayProgress, id: string): DayProgress {
  return {
    ...progress,
    postponed: [...progress.postponed.filter((p) => p !== id), id],
  };
}
