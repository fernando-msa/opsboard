import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const services = await prisma.service.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('SERVICES_GET_ERROR', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
