import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

type ServiceStatus = 'OPERATIONAL' | 'DEGRADED' | 'DOWN';

const VALID_STATUSES = new Set<ServiceStatus>(['OPERATIONAL', 'DEGRADED', 'DOWN']);

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const { id } = await context.params;

    const existing = await prisma.incident.findFirst({ where: { id, organizationId: session.organizationId } });
    if (!existing) return NextResponse.json({ error: 'Incidente não encontrado' }, { status: 404 });

    const payload = await request.json();
    const status = payload.status as ServiceStatus | undefined;

    if (!status || !VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Status é obrigatório. Use: OPERATIONAL, DEGRADED ou DOWN.' }, { status: 400 });
    }

    const incident = await prisma.incident.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === 'OPERATIONAL' ? new Date() : null
      }
    });

    if (existing.serviceId) {
      await prisma.service.updateMany({
        where: { id: existing.serviceId, organizationId: session.organizationId },
        data: { status }
      });
    }

    return NextResponse.json(incident);
  } catch (error) {
    console.error('INCIDENT_PUT_ERROR', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const { id } = await context.params;

    const existing = await prisma.incident.findFirst({ where: { id, organizationId: session.organizationId } });
    if (!existing) return NextResponse.json({ error: 'Incidente não encontrado' }, { status: 404 });

    await prisma.incident.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('INCIDENT_DELETE_ERROR', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
