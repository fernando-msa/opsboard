'use client';

import { useState } from 'react';

type Ticket = {
  id: string;
  title: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
};

const statusLabel: Record<Ticket['status'], string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em andamento',
  RESOLVED: 'Resolvido',
  CLOSED: 'Fechado'
};

export function TicketTable({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState(initialTickets);

  async function updateStatus(ticket: Ticket, status: Ticket['status']) {
    const response = await fetch(`/api/tickets/${ticket.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (!response.ok) return;

    setTickets((current) => current.map((item) => (item.id === ticket.id ? { ...item, status } : item)));
  }

  async function removeTicket(id: string) {
    const response = await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
    if (!response.ok) return;

    setTickets((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="card overflow-auto lg:col-span-2">
      <h2 className="mb-4 text-lg font-semibold">Tickets recentes</h2>
      <table className="min-w-full text-left text-sm">
        <thead className="text-slate-400">
          <tr>
            <th className="pb-2">Título</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Prioridade</th>
            <th className="pb-2">Abertura</th>
            <th className="pb-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="border-t border-slate-800">
              <td className="py-2 pr-3">{ticket.title}</td>
              <td className="py-2 pr-3">{statusLabel[ticket.status]}</td>
              <td className="py-2 pr-3">{ticket.priority}</td>
              <td className="py-2">{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</td>
              <td className="py-2">
                <div className="flex gap-2">
                  <select
                    className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1"
                    value={ticket.status}
                    onChange={(e) => updateStatus(ticket, e.target.value as Ticket['status'])}
                  >
                    <option value="OPEN">Aberto</option>
                    <option value="IN_PROGRESS">Em andamento</option>
                    <option value="RESOLVED">Resolvido</option>
                    <option value="CLOSED">Fechado</option>
                  </select>
                  <button onClick={() => removeTicket(ticket.id)} className="rounded-md border border-rose-800 px-2 py-1 text-rose-300 hover:bg-rose-950/40">
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
