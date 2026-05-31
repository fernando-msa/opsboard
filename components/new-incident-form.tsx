'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type Service = { id: string; name: string };

export function NewIncidentForm({ services }: { services: Service[] }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('DEGRADED');
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function createIncident(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const response = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, status, serviceId })
    });

    if (!response.ok) {
      setError('Falha ao criar incidente. Tente novamente.');
      return;
    }

    setTitle('');
    setDescription('');
    setStatus('DEGRADED');
    router.refresh();
  }

  return (
    <form onSubmit={createIncident} className="card space-y-3">
      <h2 className="text-lg font-semibold">Novo incidente</h2>
      {error && (
        <div className="rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
      <input className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" />
      <textarea className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" />
      <select className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="OPERATIONAL">Operacional</option>
        <option value="DEGRADED">Degradado</option>
        <option value="DOWN">Fora do ar</option>
      </select>
      <select className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
        {services.map((service) => (
          <option key={service.id} value={service.id}>
            {service.name}
          </option>
        ))}
      </select>
      <button className="rounded-lg bg-brand-600 px-4 py-2 font-semibold hover:bg-brand-500">Criar incidente</button>
    </form>
  );
}
