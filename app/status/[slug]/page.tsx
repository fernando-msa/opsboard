import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

const statusMap: Record<string, string> = {
  OPERATIONAL: 'Operacional',
  DEGRADED: 'Degradado',
  DOWN: 'Fora do ar'
};

export default async function PublicStatusPage({ params }: { params: { slug: string } }) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.slug },
    include: {
      services: { orderBy: { name: 'asc' } },
      incidents: { orderBy: { createdAt: 'desc' }, take: 10 }
    }
  });

  if (!org) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Status Page • {org.name}</h1>
        <p className="text-slate-400">Atualizado em tempo real com os últimos incidentes.</p>
      </header>

      <section className="mb-6 grid gap-3">
        {org.services.map((service) => (
          <article key={service.id} className="card flex items-center justify-between">
            <h2 className="font-medium">{service.name}</h2>
            <span className="text-sm text-slate-300">{statusMap[service.status]}</span>
          </article>
        ))}
      </section>

      <section className="card">
        <h2 className="mb-3 text-lg font-semibold">Incidentes recentes</h2>
        <div className="space-y-3">
          {org.incidents.map((incident) => (
            <article key={incident.id} className="rounded-lg border border-slate-800 p-3">
              <p className="font-medium">{incident.title}</p>
              <p className="text-sm text-slate-300">{incident.description}</p>
              <p className="mt-1 text-xs text-slate-400">{new Date(incident.createdAt).toLocaleString('pt-BR')}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
