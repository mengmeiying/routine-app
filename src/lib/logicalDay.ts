export const DAY_START_HOUR = 6;

const HOUR_MS = 60 * 60 * 1000;

const pad = (n: number): string => String(n).padStart(2, '0');

// The logical day runs 06:00-06:00, so its date is the date of (now - 6h).
export function getLogicalDate(now: Date): string {
  const shifted = new Date(now.getTime() - DAY_START_HOUR * HOUR_MS);
  return `${shifted.getFullYear()}-${pad(shifted.getMonth() + 1)}-${pad(shifted.getDate())}`;
}
