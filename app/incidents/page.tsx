import { redirect } from 'next/navigation';
import { Header } from '@/components/header';
import { IncidentList } from '@/components/incident-list';
import { NewIncidentForm } from '@/components/new-incident-form';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
        <IncidentList
          initialIncidents={incidents.map((incident) => ({
            id: incident.id,
            title: incident.title,
            description: incident.description,
            status: incident.status,
            createdAt: incident.createdAt.toISOString(),
            service: incident.service ? { name: incident.service.name } : null
          }))}
        />
      </section>
    </main>
  );
}
