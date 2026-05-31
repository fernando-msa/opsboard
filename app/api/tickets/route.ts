import { TicketPriority } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PRIORITY_HOURS } from '@/lib/constants';

const VALID_PRIORITIES = new Set<string>(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const tickets = await prisma.ticket.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('TICKETS_GET_ERROR', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const { title, description, priority = 'MEDIUM' } = await request.json();

    if (typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Título é obrigatório.' }, { status: 400 });
    }
    if (title.length > 200) {
      return NextResponse.json({ error: 'Título deve ter no máximo 200 caracteres.' }, { status: 400 });
    }
    if (typeof description !== 'string' || !description.trim()) {
      return NextResponse.json({ error: 'Descrição é obrigatória.' }, { status: 400 });
    }
    if (description.length > 5000) {
      return NextResponse.json({ error: 'Descrição deve ter no máximo 5000 caracteres.' }, { status: 400 });
    }
    if (!VALID_PRIORITIES.has(priority)) {
      return NextResponse.json({ error: 'Prioridade inválida. Use: LOW, MEDIUM, HIGH ou CRITICAL.' }, { status: 400 });
    }

    const parsedPriority = priority as TicketPriority;
    const dueAt = new Date(Date.now() + PRIORITY_HOURS[parsedPriority] * 60 * 60 * 1000);

    const ticket = await prisma.ticket.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        priority: parsedPriority,
        dueAt,
        organizationId: session.organizationId
      }
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('TICKETS_POST_ERROR', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
