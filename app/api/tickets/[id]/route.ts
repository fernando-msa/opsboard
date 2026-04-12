import { TicketStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const existing = await prisma.ticket.findFirst({ where: { id: params.id, organizationId: session.organizationId } });
  if (!existing) return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });

  const { title, description, status, priority } = await request.json();

  const ticket = await prisma.ticket.update({
    where: { id: params.id },
    data: {
      title,
      description,
      status,
      priority,
      resolvedAt: status === TicketStatus.RESOLVED || status === TicketStatus.CLOSED ? new Date() : null
    }
  });

  return NextResponse.json(ticket);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const existing = await prisma.ticket.findFirst({ where: { id: params.id, organizationId: session.organizationId } });
  if (!existing) return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });

  await prisma.ticket.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
