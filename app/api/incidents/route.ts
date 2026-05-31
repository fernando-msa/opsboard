import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type ServiceStatus = 'OPERATIONAL' | 'DEGRADED' | 'DOWN';

const validStatuses = new Set<ServiceStatus>(['OPERATIONAL', 'DEGRADED', 'DOWN']);

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const incidents = await prisma.incident.findMany({
    where: { organizationId: session.organizationId },
    include: { service: true },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(incidents);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { title, description, status, serviceId } = await request.json();

  if (typeof title !== 'string' || !title.trim() || typeof description !== 'string' || !description.trim()) {
    return NextResponse.json({ error: 'Título e descrição são obrigatórios.' }, { status: 400 });
  }

  if (typeof status !== 'string' || !validStatuses.has(status as ServiceStatus)) {
    return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
  }

  let validServiceId: string | null = null;
  if (typeof serviceId === 'string' && serviceId.trim()) {
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        organizationId: session.organizationId
      },
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
}
