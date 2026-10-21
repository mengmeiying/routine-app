import { describe, expect, it } from 'vitest';
import { getRoutineKind } from './routine';

const at = (h: number, min = 0) => new Date(2026, 9, 21, h, min);

describe('getRoutineKind', () => {
  it('05:59 is evening', () => {
    expect(getRoutineKind(at(5, 59))).toBe('evening');
  });

  it('06:00 is morning', () => {
    expect(getRoutineKind(at(6, 0))).toBe('morning');
  });

  it('17:59 is morning', () => {
    expect(getRoutineKind(at(17, 59))).toBe('morning');
  });

  it('18:00 is evening', () => {
    expect(getRoutineKind(at(18, 0))).toBe('evening');
  });

  it('00:00 is evening', () => {
    expect(getRoutineKind(at(0, 0))).toBe('evening');
  });
});
