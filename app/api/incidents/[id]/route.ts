import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { id } = await context.params;

  const existing = await prisma.incident.findFirst({ where: { id, organizationId: session.organizationId } });
  if (!existing) return NextResponse.json({ error: 'Incidente não encontrado' }, { status: 404 });

  const payload = await request.json();
  const status = payload.status as 'OPERATIONAL' | 'DEGRADED' | 'DOWN' | undefined;

  if (!status) {
    return NextResponse.json({ error: 'Status é obrigatório.' }, { status: 400 });
  }

  const incident = await prisma.incident.update({
    where: { id },
    data: {
      status,
      resolvedAt: status === 'OPERATIONAL' ? new Date() : null
    }
  });

  if (existing.serviceId) {
    await prisma.service.update({ where: { id: existing.serviceId }, data: { status } });
  }

  return NextResponse.json(incident);
}

export async function DELETE(_: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { id } = await context.params;

  const existing = await prisma.incident.findFirst({ where: { id, organizationId: session.organizationId } });
  if (!existing) return NextResponse.json({ error: 'Incidente não encontrado' }, { status: 404 });

  await prisma.incident.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
