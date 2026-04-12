import { TicketPriority } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const priorityHours: Record<TicketPriority, number> = {
  LOW: 72,
  MEDIUM: 48,
  HIGH: 24,
  CRITICAL: 8
};

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const tickets = await prisma.ticket.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(tickets);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { title, description, priority = 'MEDIUM' } = await request.json();
  const parsedPriority = priority as TicketPriority;
  const dueAt = new Date(Date.now() + priorityHours[parsedPriority] * 60 * 60 * 1000);

  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      priority: parsedPriority,
      dueAt,
      organizationId: session.organizationId
    }
  });

  return NextResponse.json(ticket, { status: 201 });
}
