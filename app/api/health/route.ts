import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificar conexão com banco
    const demoOrg = await prisma.organization.findUnique({
      where: { slug: 'demo-company' },
      include: { users: true }
    });

    if (!demoOrg) {
      return NextResponse.json(
        {
          status: 'seed_incomplete',
          message: 'Organização demo não encontrada. Seed pode não ter rodado corretamente.',
          database: 'connected',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }

    const userCount = demoOrg.users.length;
    const serviceCount = await prisma.service.count({
      where: { organizationId: demoOrg.id }
    });
    const ticketCount = await prisma.ticket.count({
      where: { organizationId: demoOrg.id }
    });

    return NextResponse.json(
      {
        status: 'healthy',
        message: 'Sistema operacional e banco de dados conectado.',
        database: 'connected',
        organization: {
          name: demoOrg.name,
          slug: demoOrg.slug,
          users: userCount,
          services: serviceCount,
          tickets: ticketCount
        },
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('HEALTH_CHECK_ERROR', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        message: 'Falha ao verificar status do banco de dados',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
