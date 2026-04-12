import { redirect } from 'next/navigation';
import { Header } from '@/components/header';
import { NewTicketForm } from '@/components/new-ticket-form';
import { TicketTable } from '@/components/ticket-table';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateSlaMetrics } from '@/lib/sla';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [org, tickets] = await Promise.all([
    prisma.organization.findUnique({ where: { id: session.organizationId } }),
    prisma.ticket.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
  ]);

  const metrics = calculateSlaMetrics(tickets);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <Header orgSlug={org?.slug || ''} />

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <article className="card">
          <p className="text-sm text-slate-400">Tickets totais</p>
          <p className="mt-2 text-3xl font-semibold">{tickets.length}</p>
        </article>
        <article className="card">
          <p className="text-sm text-slate-400">Tempo médio de atendimento</p>
          <p className="mt-2 text-3xl font-semibold">{metrics.avgResolutionHours}h</p>
        </article>
        <article className="card">
          <p className="text-sm text-slate-400">Dentro do SLA</p>
          <p className="mt-2 text-3xl font-semibold">{metrics.withinSlaPercent}%</p>
        </article>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <NewTicketForm />
        </div>
        <TicketTable
          initialTickets={tickets.map((ticket) => ({
            id: ticket.id,
            title: ticket.title,
            status: ticket.status,
            priority: ticket.priority,
            createdAt: ticket.createdAt.toISOString()
          }))}
        />
      </section>
    </main>
  );
}
