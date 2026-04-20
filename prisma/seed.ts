import bcrypt from 'bcryptjs';
import { PrismaClient, ServiceStatus, TicketPriority, TicketStatus } from '@prisma/client';

const prisma = new PrismaClient();

const priorityHours: Record<TicketPriority, number> = {
  LOW: 72,
  MEDIUM: 48,
  HIGH: 24,
  CRITICAL: 8
};

const demoAccounts = [
  { name: 'Demo Admin', email: 'admin@demo.com' },
  { name: 'Demo Support', email: 'suporte@demo.com' },
  { name: 'Demo Ops', email: 'ops@demo.com' }
];

const serviceSeeds = [
  {
    name: 'API Gateway',
    description: 'Entrada pública, autenticação e roteamento das requisições.',
    status: ServiceStatus.OPERATIONAL
  },
  {
    name: 'Auth Service',
    description: 'Login, sessão e validação dos tokens do produto.',
    status: ServiceStatus.OPERATIONAL
  },
  {
    name: 'Billing',
    description: 'Cobranças, faturas e integrações financeiras.',
    status: ServiceStatus.DOWN
  },
  {
    name: 'Worker Queue',
    description: 'Jobs assíncronos, e-mails e notificações.',
    status: ServiceStatus.DEGRADED
  },
  {
    name: 'Analytics',
    description: 'Métricas agregadas do dashboard e relatórios executivos.',
    status: ServiceStatus.OPERATIONAL
  },
  {
    name: 'Status Page',
    description: 'Página pública de saúde dos serviços por organização.',
    status: ServiceStatus.OPERATIONAL
  }
];

const ticketSeeds: Array<{
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdHoursAgo: number;
  resolvedHoursAfterCreation?: number;
}> = [
  {
    title: 'Checkout travando na captura de cartão',
    description: 'Clientes relatam falha imediata ao finalizar pedidos com cartão internacional.',
    priority: TicketPriority.CRITICAL,
    status: TicketStatus.OPEN,
    createdHoursAgo: 3
  },
  {
    title: 'Fila de notificações acumulando jobs',
    description: 'Envio de e-mail e Slack atrasado após o pico das 09h.',
    priority: TicketPriority.CRITICAL,
    status: TicketStatus.IN_PROGRESS,
    createdHoursAgo: 18
  },
  {
    title: 'Webhook de pagamento com timeout intermitente',
    description: 'ERP responde fora do padrão e provoca reprocessamento manual.',
    priority: TicketPriority.HIGH,
    status: TicketStatus.IN_PROGRESS,
    createdHoursAgo: 27
  },
  {
    title: 'Lentidão no painel administrativo após login',
    description: 'Primeiro carregamento da tela principal acima de 6 segundos em horário comercial.',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.RESOLVED,
    createdHoursAgo: 52,
    resolvedHoursAfterCreation: 14
  },
  {
    title: 'Exportação CSV de contratos truncando colunas',
    description: 'Relatório financeiro sai com campos vazios em planilhas de clientes grandes.',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.CLOSED,
    createdHoursAgo: 60,
    resolvedHoursAfterCreation: 20
  },
  {
    title: 'Inconsistência em dados de clientes duplicados',
    description: 'Dois registros com o mesmo CNPJ aparecem na busca global.',
    priority: TicketPriority.HIGH,
    status: TicketStatus.RESOLVED,
    createdHoursAgo: 74,
    resolvedHoursAfterCreation: 30
  },
  {
    title: 'Relatório financeiro sem centro de custo',
    description: 'A coluna de centro de custo some ao filtrar por mês corrente.',
    priority: TicketPriority.LOW,
    status: TicketStatus.RESOLVED,
    createdHoursAgo: 82,
    resolvedHoursAfterCreation: 18
  },
  {
    title: 'Problema de autenticação em sessão expirada',
    description: 'Usuários são derrubados ao alternar entre abas abertas por muito tempo.',
    priority: TicketPriority.HIGH,
    status: TicketStatus.CLOSED,
    createdHoursAgo: 96,
    resolvedHoursAfterCreation: 22
  },
  {
    title: 'Dashboard consumindo dados desatualizados',
    description: 'A visão executiva demora para refletir métricas após criação de tickets.',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.OPEN,
    createdHoursAgo: 11
  },
  {
    title: 'Falha na importação de clientes via planilha',
    description: 'Arquivos com campos opcionais não concluem o processamento em lote.',
    priority: TicketPriority.HIGH,
    status: TicketStatus.RESOLVED,
    createdHoursAgo: 108,
    resolvedHoursAfterCreation: 12
  },
  {
    title: 'Alerta falso de SLA para chamados encerrados',
    description: 'Tickets resolvidos continuam aparecendo como fora do SLA em alguns filtros.',
    priority: TicketPriority.LOW,
    status: TicketStatus.RESOLVED,
    createdHoursAgo: 124,
    resolvedHoursAfterCreation: 44
  },
  {
    title: 'Sincronização de catálogo atrasada no worker',
    description: 'Produtos novos levam mais tempo que o esperado para aparecer no portal.',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.IN_PROGRESS,
    createdHoursAgo: 32
  },
  {
    title: 'Webhook de atualização de status falhando no cliente',
    description: 'Integração externa tenta reenviar eventos já processados.',
    priority: TicketPriority.HIGH,
    status: TicketStatus.OPEN,
    createdHoursAgo: 14
  },
  {
    title: 'Limite de upload de anexos abaixo do esperado',
    description: 'Arquivos grandes são rejeitados antes de completar a análise antivírus.',
    priority: TicketPriority.LOW,
    status: TicketStatus.CLOSED,
    createdHoursAgo: 140,
    resolvedHoursAfterCreation: 26
  },
  {
    title: 'Painel de incidentes não ordena por prioridade',
    description: 'Incidentes críticos acabam escondidos por entradas mais antigas.',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.RESOLVED,
    createdHoursAgo: 156,
    resolvedHoursAfterCreation: 32
  },
  {
    title: 'Conciliação bancária apresentando atraso',
    description: 'Operação precisa fechar o dia manualmente em situações de alta demanda.',
    priority: TicketPriority.CRITICAL,
    status: TicketStatus.IN_PROGRESS,
    createdHoursAgo: 20
  },
  {
    title: 'Falta de permissão ao exportar relatórios',
    description: 'Usuários sem perfil administrativo recebem erro genérico ao clicar em exportar.',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.RESOLVED,
    createdHoursAgo: 170,
    resolvedHoursAfterCreation: 10
  },
  {
    title: 'Busca de tickets sem filtro por prioridade',
    description: 'Equipe de suporte pediu um recorte rápido para priorizar o plantão.',
    priority: TicketPriority.LOW,
    status: TicketStatus.OPEN,
    createdHoursAgo: 6
  }
];

const incidentSeeds = [
  {
    title: 'Degradação intermitente no Worker Queue',
    description: 'Jobs de notificação acumulam durante o horário de pico e voltam ao normal em seguida.',
    status: ServiceStatus.DEGRADED,
    serviceIndex: 3,
    createdHoursAgo: 5
  },
  {
    title: 'Falha no processamento de cobranças',
    description: 'Serviço de Billing ficou indisponível por uma janela curta e já foi normalizado.',
    status: ServiceStatus.OPERATIONAL,
    serviceIndex: 2,
    createdHoursAgo: 28,
    resolvedHoursAfterCreation: 2
  },
  {
    title: 'Latência elevada na API pública',
    description: 'Usuários percebem atraso nas rotas de leitura após o aumento de tráfego.',
    status: ServiceStatus.DEGRADED,
    serviceIndex: 0,
    createdHoursAgo: 12
  },
  {
    title: 'Autenticação impactada por erro de cache',
    description: 'Um bug no cache foi corrigido e os logins voltaram ao normal.',
    status: ServiceStatus.OPERATIONAL,
    serviceIndex: 1,
    createdHoursAgo: 60,
    resolvedHoursAfterCreation: 3
  },
  {
    title: 'Status page pública sem atraso de atualização',
    description: 'Monitoramento permaneceu estável após a última intervenção operacional.',
    status: ServiceStatus.OPERATIONAL,
    serviceIndex: 5,
    createdHoursAgo: 96,
    resolvedHoursAfterCreation: 1
  }
];

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

async function main() {
  const orgSlug = 'demo-company';

  await prisma.organization.deleteMany({ where: { slug: orgSlug } });

  const org = await prisma.organization.create({
    data: {
      name: 'Demo Company',
      slug: orgSlug,
      users: {
        create: await Promise.all(
          demoAccounts.map(async (account) => ({
            name: account.name,
            email: account.email,
            passwordHash: await bcrypt.hash('demo1234', 10)
          }))
        )
      },
      services: {
        create: serviceSeeds
      }
    },
    include: { services: true }
  });

  for (const ticketSeed of ticketSeeds) {
    const createdAt = hoursAgo(ticketSeed.createdHoursAgo);
    const dueAt = new Date(createdAt.getTime() + priorityHours[ticketSeed.priority] * 60 * 60 * 1000);
    const resolvedAt =
      ticketSeed.status === TicketStatus.OPEN || ticketSeed.status === TicketStatus.IN_PROGRESS
        ? null
        : new Date(createdAt.getTime() + (ticketSeed.resolvedHoursAfterCreation ?? priorityHours[ticketSeed.priority]) * 60 * 60 * 1000);

    await prisma.ticket.create({
      data: {
        title: ticketSeed.title,
        description: ticketSeed.description,
        status: ticketSeed.status,
        priority: ticketSeed.priority,
        createdAt,
        dueAt,
        resolvedAt,
        organizationId: org.id
      }
    });
  }

  for (const incidentSeed of incidentSeeds) {
    const createdAt = hoursAgo(incidentSeed.createdHoursAgo);
    const resolvedAt =
      incidentSeed.status === ServiceStatus.OPERATIONAL && incidentSeed.resolvedHoursAfterCreation !== undefined
        ? new Date(createdAt.getTime() + incidentSeed.resolvedHoursAfterCreation * 60 * 60 * 1000)
        : null;

    await prisma.incident.create({
      data: {
        title: incidentSeed.title,
        description: incidentSeed.description,
        status: incidentSeed.status,
        organizationId: org.id,
        serviceId: org.services[incidentSeed.serviceIndex]?.id ?? null,
        createdAt,
        resolvedAt
      }
    });
  }

  console.log('Seed finalizado');
  console.log('Organizacao demo: demo-company');
  console.log('Contas demo: admin@demo.com, suporte@demo.com, ops@demo.com');
  console.log('Senha para todas: demo1234');
}

main().finally(async () => {
  await prisma.$disconnect();
});
