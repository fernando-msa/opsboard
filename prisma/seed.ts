import bcrypt from 'bcryptjs';
import { PrismaClient, ServiceStatus, TicketPriority, TicketStatus } from '@prisma/client';

const prisma = new PrismaClient();

const priorityHours: Record<TicketPriority, number> = {
  LOW: 72,
  MEDIUM: 48,
  HIGH: 24,
  CRITICAL: 8
};

const titles = [
  'Erro de integração com ERP',
  'Lentidão no painel administrativo',
  'Timeout em webhook de pagamento',
  'Falha na exportação de relatório',
  'Inconsistência em dados de clientes'
];

async function main() {
  const orgSlug = 'demo-company';

  await prisma.organization.deleteMany({ where: { slug: orgSlug } });

  const org = await prisma.organization.create({
    data: {
      name: 'Demo Company',
      slug: orgSlug,
      users: {
        create: {
          name: 'Demo Admin',
          email: 'admin@demo.com',
          passwordHash: await bcrypt.hash('demo1234', 10)
        }
      },
      services: {
        create: [
          { name: 'API Gateway', status: ServiceStatus.OPERATIONAL },
          { name: 'Worker Queue', status: ServiceStatus.DEGRADED },
          { name: 'Billing', status: ServiceStatus.OPERATIONAL }
        ]
      }
    },
    include: { services: true }
  });

  for (let i = 0; i < 20; i++) {
    const priority = Object.values(TicketPriority)[i % 4];
    const createdAt = new Date(Date.now() - (20 - i) * 12 * 60 * 60 * 1000);
    const dueAt = new Date(createdAt.getTime() + priorityHours[priority] * 60 * 60 * 1000);
    const resolved = i % 3 !== 0;
    const resolvedAt = resolved ? new Date(createdAt.getTime() + (i % 8 + 1) * 60 * 60 * 1000) : null;

    await prisma.ticket.create({
      data: {
        title: `${titles[i % titles.length]} #${i + 1}`,
        description: 'Chamado gerado para demonstração de SLA e monitoramento operacional.',
        status: resolved ? TicketStatus.RESOLVED : TicketStatus.IN_PROGRESS,
        priority,
        createdAt,
        dueAt,
        resolvedAt,
        organizationId: org.id
      }
    });
  }

  await prisma.incident.createMany({
    data: [
      {
        title: 'Degradação intermitente na API',
        description: 'Latência acima do normal em horários de pico.',
        status: ServiceStatus.DEGRADED,
        organizationId: org.id,
        serviceId: org.services[0].id
      },
      {
        title: 'Falha no processamento de pagamentos',
        description: 'Serviço fora do ar por 20 minutos, já estabilizado.',
        status: ServiceStatus.OPERATIONAL,
        organizationId: org.id,
        serviceId: org.services[2].id,
        resolvedAt: new Date()
      }
    ]
  });

  console.log('Seed finalizado: admin@demo.com / demo1234');
}

main().finally(async () => {
  await prisma.$disconnect();
});
