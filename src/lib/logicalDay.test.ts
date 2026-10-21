import { describe, expect, it } from 'vitest';
import { getLogicalDate } from './logicalDay';

// Local-time constructor keeps tests independent of the machine's timezone.
const at = (y: number, m: number, d: number, h: number, min = 0) =>
  new Date(y, m - 1, d, h, min);

describe('getLogicalDate', () => {
  it('05:59 still belongs to the previous day', () => {
    expect(getLogicalDate(at(2026, 10, 21, 5, 59))).toBe('2026-10-20');
  });

  it('06:00 starts the new day', () => {
    expect(getLogicalDate(at(2026, 10, 21, 6, 0))).toBe('2026-10-21');
  });

  it('17:59 and 18:00 are the same day', () => {
    expect(getLogicalDate(at(2026, 10, 21, 17, 59))).toBe('2026-10-21');
    expect(getLogicalDate(at(2026, 10, 21, 18, 0))).toBe('2026-10-21');
  });

  it('00:00 belongs to the previous day', () => {
    expect(getLogicalDate(at(2026, 10, 21, 0, 0))).toBe('2026-10-20');
  });

  it('23:59 belongs to the same day', () => {
    expect(getLogicalDate(at(2026, 10, 21, 23, 59))).toBe('2026-10-21');
  });

  it('crosses month and year boundaries', () => {
    expect(getLogicalDate(at(2026, 11, 1, 2))).toBe('2026-10-31');
    expect(getLogicalDate(at(2027, 1, 1, 2))).toBe('2026-12-31');
  });
});
