import { redirect } from 'next/navigation';
import { Header } from '@/components/header';
import { NewIncidentForm } from '@/components/new-incident-form';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const statusMap: Record<string, string> = {
  OPERATIONAL: 'Operacional',
  DEGRADED: 'Degradado',
  DOWN: 'Fora do ar'
};

export default async function IncidentsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [org, incidents, services] = await Promise.all([
    prisma.organization.findUnique({ where: { id: session.organizationId } }),
    prisma.incident.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: 'desc' },
      include: { service: true }
    }),
    prisma.service.findMany({ where: { organizationId: session.organizationId }, orderBy: { name: 'asc' } })
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <Header orgSlug={org?.slug || ''} />
      <section className="grid gap-4 lg:grid-cols-3">
        <NewIncidentForm services={services} />

        <div className="card lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Histórico de incidentes</h2>
          <div className="space-y-3">
            {incidents.map((incident) => (
              <article key={incident.id} className="rounded-lg border border-slate-800 p-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{incident.title}</h3>
                  <span className="text-sm text-slate-400">{statusMap[incident.status]}</span>
                </div>
                <p className="mt-1 text-sm text-slate-300">{incident.description}</p>
                <p className="mt-2 text-xs text-slate-400">
                  Serviço: {incident.service?.name ?? 'N/A'} • {new Date(incident.createdAt).toLocaleString('pt-BR')}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
