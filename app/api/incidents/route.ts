import { ServiceStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const VALID_STATUSES = new Set<string>(['OPERATIONAL', 'DEGRADED', 'DOWN']);

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const incidents = await prisma.incident.findMany({
      where: { organizationId: session.organizationId },
      include: { service: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(incidents);
  } catch (error) {
    console.error('INCIDENTS_GET_ERROR', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const { title, description, status, serviceId } = await request.json();

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
    if (!VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Status inválido. Use: OPERATIONAL, DEGRADED ou DOWN.' }, { status: 400 });
    }

    let validServiceId: string | null = null;
    if (typeof serviceId === 'string' && serviceId.trim()) {
      const service = await prisma.service.findFirst({
        where: { id: serviceId, organizationId: session.organizationId },
        select: { id: true }
      });

      if (!service) {
        return NextResponse.json({ error: 'Serviço não encontrado.' }, { status: 404 });
      }

      validServiceId = service.id;
    }

    const incident = await prisma.incident.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        status: status as ServiceStatus,
        serviceId: validServiceId,
        organizationId: session.organizationId
      }
    });

    if (validServiceId) {
      await prisma.service.update({
        where: { id: validServiceId },
        data: { status: status as ServiceStatus }
      });
    }

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error('INCIDENTS_POST_ERROR', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
