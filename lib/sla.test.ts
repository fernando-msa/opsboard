import { describe, it, expect } from 'vitest';
import { calculateSlaMetrics } from './sla';
import type { Ticket } from '@prisma/client';

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: '1',
    title: 'Test',
    description: 'Test',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    createdAt: new Date('2026-01-01T10:00:00Z'),
    dueAt: new Date('2026-01-03T10:00:00Z'),
    resolvedAt: new Date('2026-01-02T10:00:00Z'),
    organizationId: 'org-1',
    ...overrides
  } as Ticket;
}

describe('calculateSlaMetrics', () => {
  it('returns zeros for empty tickets array', () => {
    const result = calculateSlaMetrics([]);
    expect(result).toEqual({ avgResolutionHours: 0, withinSlaPercent: 0 });
  });

  it('returns zeros when no tickets are resolved', () => {
    const tickets = [
      makeTicket({ resolvedAt: null }),
      makeTicket({ id: '2', resolvedAt: null })
    ];
    const result = calculateSlaMetrics(tickets);
    expect(result).toEqual({ avgResolutionHours: 0, withinSlaPercent: 0 });
  });

  it('returns 100% SLA when all tickets resolved within deadline', () => {
    const tickets = [
      makeTicket({
        createdAt: new Date('2026-01-01T10:00:00Z'),
        dueAt: new Date('2026-01-03T10:00:00Z'),
        resolvedAt: new Date('2026-01-02T10:00:00Z')
      })
    ];
    const result = calculateSlaMetrics(tickets);
    expect(result.withinSlaPercent).toBe(100);
    expect(result.avgResolutionHours).toBe(24);
  });

  it('returns 0% SLA when all tickets resolved after deadline', () => {
    const tickets = [
      makeTicket({
        createdAt: new Date('2026-01-01T10:00:00Z'),
        dueAt: new Date('2026-01-02T10:00:00Z'),
        resolvedAt: new Date('2026-01-05T10:00:00Z')
      })
    ];
    const result = calculateSlaMetrics(tickets);
    expect(result.withinSlaPercent).toBe(0);
    expect(result.avgResolutionHours).toBe(96);
  });

  it('calculates correct percentage for mixed results', () => {
    const tickets = [
      makeTicket({
        id: '1',
        createdAt: new Date('2026-01-01T10:00:00Z'),
        dueAt: new Date('2026-01-03T10:00:00Z'),
        resolvedAt: new Date('2026-01-02T10:00:00Z')
      }),
      makeTicket({
        id: '2',
        createdAt: new Date('2026-01-01T10:00:00Z'),
        dueAt: new Date('2026-01-02T10:00:00Z'),
        resolvedAt: new Date('2026-01-05T10:00:00Z')
      })
    ];
    const result = calculateSlaMetrics(tickets);
    expect(result.withinSlaPercent).toBe(50);
  });

  it('ignores unresolved tickets in SLA calculation', () => {
    const tickets = [
      makeTicket({
        id: '1',
        resolvedAt: new Date('2026-01-02T10:00:00Z'),
        dueAt: new Date('2026-01-03T10:00:00Z')
      }),
      makeTicket({ id: '2', resolvedAt: null })
    ];
    const result = calculateSlaMetrics(tickets);
    expect(result.withinSlaPercent).toBe(100);
  });
});
