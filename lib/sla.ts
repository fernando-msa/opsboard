import { Ticket } from '@prisma/client';

export function calculateSlaMetrics(tickets: Ticket[]) {
  const resolved = tickets.filter((ticket) => ticket.resolvedAt);

  if (resolved.length === 0) {
    return {
      avgResolutionHours: 0,
      withinSlaPercent: 0
    };
  }

  const totalResolutionMs = resolved.reduce((acc, ticket) => {
    const end = ticket.resolvedAt as Date;
    return acc + (end.getTime() - ticket.createdAt.getTime());
  }, 0);

  const withinSla = resolved.filter((ticket) => (ticket.resolvedAt as Date) <= ticket.dueAt).length;

  return {
    avgResolutionHours: Number((totalResolutionMs / resolved.length / 1000 / 60 / 60).toFixed(2)),
    withinSlaPercent: Number(((withinSla / resolved.length) * 100).toFixed(1))
  };
}
