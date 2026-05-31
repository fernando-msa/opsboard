import { TicketPriority, TicketStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const VALID_STATUSES = new Set<string>(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);
const VALID_PRIORITIES = new Set<string>(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const { id } = await context.params;

    const existing = await prisma.ticket.findFirst({ where: { id, organizationId: session.organizationId } });
    if (!existing) return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });

    const { title, description, status, priority } = await request.json();

    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return NextResponse.json({ error: 'Título inválido.' }, { status: 400 });
    }
    if (title && title.length > 200) {
      return NextResponse.json({ error: 'Título deve ter no máximo 200 caracteres.' }, { status: 400 });
    }
    if (description !== undefined && typeof description !== 'string') {
      return NextResponse.json({ error: 'Descrição inválida.' }, { status: 400 });
    }
    if (description && description.length > 5000) {
      return NextResponse.json({ error: 'Descrição deve ter no máximo 5000 caracteres.' }, { status: 400 });
    }
    if (status !== undefined && !VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
    }
    if (priority !== undefined && !VALID_PRIORITIES.has(priority)) {
      return NextResponse.json({ error: 'Prioridade inválida.' }, { status: 400 });
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        resolvedAt: status === TicketStatus.RESOLVED || status === TicketStatus.CLOSED ? new Date() : null
      }
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('TICKET_PUT_ERROR', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const { id } = await context.params;

    const existing = await prisma.ticket.findFirst({ where: { id, organizationId: session.organizationId } });
    if (!existing) return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });

    await prisma.ticket.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('TICKET_DELETE_ERROR', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
