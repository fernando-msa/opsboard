import { redirect } from 'next/navigation';
import { Header } from '@/components/header';
import { NewTicketForm } from '@/components/new-ticket-form';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateSlaMetrics } from '@/lib/sla';

const statusLabel: Record<string, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em andamento',
  RESOLVED: 'Resolvido',
  CLOSED: 'Fechado'
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [org, tickets] = await Promise.all([
    prisma.organization.findUnique({ where: { id: session.organizationId } }),
    prisma.ticket.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: 'desc' },
      take: 15
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
        <div className="card overflow-auto lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Tickets recentes</h2>
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="pb-2">Título</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Prioridade</th>
                <th className="pb-2">Abertura</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-t border-slate-800">
                  <td className="py-2 pr-3">{ticket.title}</td>
                  <td className="py-2 pr-3">{statusLabel[ticket.status]}</td>
                  <td className="py-2 pr-3">{ticket.priority}</td>
                  <td className="py-2">{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
