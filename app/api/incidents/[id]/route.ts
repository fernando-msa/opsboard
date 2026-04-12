import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const existing = await prisma.incident.findFirst({ where: { id: params.id, organizationId: session.organizationId } });
  if (!existing) return NextResponse.json({ error: 'Incidente não encontrado' }, { status: 404 });

  const data = await request.json();

  const incident = await prisma.incident.update({
    where: { id: params.id },
    data: {
      ...data,
      resolvedAt: data.status === 'OPERATIONAL' ? new Date() : null
    }
  });

  return NextResponse.json(incident);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const existing = await prisma.incident.findFirst({ where: { id: params.id, organizationId: session.organizationId } });
  if (!existing) return NextResponse.json({ error: 'Incidente não encontrado' }, { status: 404 });

  await prisma.incident.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
