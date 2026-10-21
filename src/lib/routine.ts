import { DAY_START_HOUR } from './logicalDay';

export type RoutineKind = 'morning' | 'evening';

const EVENING_START_HOUR = 18;

export function getRoutineKind(now: Date): RoutineKind {
  const hour = now.getHours();
  return hour >= DAY_START_HOUR && hour < EVENING_START_HOUR ? 'morning' : 'evening';
}
