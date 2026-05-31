import { TicketPriority } from '@prisma/client';

export const PRIORITY_HOURS: Record<TicketPriority, number> = {
  LOW: 72,
  MEDIUM: 48,
  HIGH: 24,
  CRITICAL: 8
};

export const SERVICE_STATUS_LABELS: Record<string, string> = {
  OPERATIONAL: 'Operacional',
  DEGRADED: 'Degradado',
  DOWN: 'Fora do ar'
};
