import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

  const incident = await prisma.incident.create({
    data: {
      title,
      description,
      status,
      serviceId,
      organizationId: session.organizationId
    }
  });

  if (serviceId) {
    await prisma.service.update({ where: { id: serviceId }, data: { status } });
  }

  return NextResponse.json(incident, { status: 201 });
}
