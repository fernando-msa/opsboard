'use client';

import { useState } from 'react';

type Incident = {
  id: string;
  title: string;
  description: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
  createdAt: string;
  service?: { name: string } | null;
};

const statusMap: Record<Incident['status'], string> = {
  OPERATIONAL: 'Operacional',
  DEGRADED: 'Degradado',
  DOWN: 'Fora do ar'
};

export function IncidentList({ initialIncidents }: { initialIncidents: Incident[] }) {
  const [incidents, setIncidents] = useState(initialIncidents);

  async function updateIncident(incident: Incident, status: Incident['status']) {
    const response = await fetch(`/api/incidents/${incident.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (!response.ok) return;

    setIncidents((current) => current.map((item) => (item.id === incident.id ? { ...item, status } : item)));
  }

  async function removeIncident(id: string) {
    const response = await fetch(`/api/incidents/${id}`, { method: 'DELETE' });
    if (!response.ok) return;

    setIncidents((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="card lg:col-span-2">
      <h2 className="mb-4 text-lg font-semibold">Histórico de incidentes</h2>
      <div className="space-y-3">
        {incidents.map((incident) => (
          <article key={incident.id} className="rounded-lg border border-slate-800 p-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">{incident.title}</h3>
              <select
                className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                value={incident.status}
                onChange={(e) => updateIncident(incident, e.target.value as Incident['status'])}
              >
                <option value="OPERATIONAL">Operacional</option>
                <option value="DEGRADED">Degradado</option>
                <option value="DOWN">Fora do ar</option>
              </select>
            </div>
            <p className="mt-1 text-sm text-slate-300">{incident.description}</p>
            <p className="mt-2 text-xs text-slate-400">
              Serviço: {incident.service?.name ?? 'N/A'} • {new Date(incident.createdAt).toLocaleString('pt-BR')} • {statusMap[incident.status]}
            </p>
            <button onClick={() => removeIncident(incident.id)} className="mt-2 rounded-md border border-rose-800 px-2 py-1 text-xs text-rose-300 hover:bg-rose-950/40">
              Excluir incidente
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
