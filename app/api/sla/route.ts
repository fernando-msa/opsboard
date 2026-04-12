import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateSlaMetrics } from '@/lib/sla';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const tickets = await prisma.ticket.findMany({ where: { organizationId: session.organizationId } });
  return NextResponse.json(calculateSlaMetrics(tickets));
}
