import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

const validStatuses = new Set<TicketStatus>(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);
const validPriorities = new Set<TicketPriority>(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export async function PUT(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { id } = await context.params;

  const existing = await prisma.ticket.findFirst({ where: { id, organizationId: session.organizationId } });
  if (!existing) return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });

  const { title, description, status, priority } = await request.json();

  if (status && !validStatuses.has(status)) {
    return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
  }

  if (priority && !validPriorities.has(priority)) {
    return NextResponse.json({ error: 'Prioridade inválida.' }, { status: 400 });
  }

  const ticket = await prisma.ticket.update({
    where: { id },
    data: {
      title,
      description,
      status,
      priority,
      resolvedAt: status === 'RESOLVED' || status === 'CLOSED' ? new Date() : null
    }
  });

  return NextResponse.json(ticket);
}

export async function DELETE(_: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { id } = await context.params;

  const existing = await prisma.ticket.findFirst({ where: { id, organizationId: session.organizationId } });
  if (!existing) return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });

  await prisma.ticket.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
