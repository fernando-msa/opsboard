import { describe, it, expect } from 'vitest';
import { PRIORITY_HOURS, SERVICE_STATUS_LABELS } from './constants';

describe('PRIORITY_HOURS', () => {
  it('has all four priority levels', () => {
    expect(PRIORITY_HOURS).toHaveProperty('LOW');
    expect(PRIORITY_HOURS).toHaveProperty('MEDIUM');
    expect(PRIORITY_HOURS).toHaveProperty('HIGH');
    expect(PRIORITY_HOURS).toHaveProperty('CRITICAL');
  });

  it('has positive hour values', () => {
    for (const hours of Object.values(PRIORITY_HOURS)) {
      expect(hours).toBeGreaterThan(0);
    }
  });

  it('has decreasing hours for higher priorities', () => {
    expect(PRIORITY_HOURS.LOW).toBeGreaterThan(PRIORITY_HOURS.MEDIUM);
    expect(PRIORITY_HOURS.MEDIUM).toBeGreaterThan(PRIORITY_HOURS.HIGH);
    expect(PRIORITY_HOURS.HIGH).toBeGreaterThan(PRIORITY_HOURS.CRITICAL);
  });
});

describe('SERVICE_STATUS_LABELS', () => {
  it('has all three service statuses', () => {
    expect(SERVICE_STATUS_LABELS).toHaveProperty('OPERATIONAL');
    expect(SERVICE_STATUS_LABELS).toHaveProperty('DEGRADED');
    expect(SERVICE_STATUS_LABELS).toHaveProperty('DOWN');
  });

  it('has non-empty string values', () => {
    for (const label of Object.values(SERVICE_STATUS_LABELS)) {
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });
});
