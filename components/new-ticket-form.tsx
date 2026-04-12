'use client';

import { FormEvent, useState } from 'react';

export function NewTicketForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  async function createTicket(event: FormEvent) {
    event.preventDefault();
    await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, priority })
    });
    window.location.reload();
  }

  return (
    <form onSubmit={createTicket} className="card space-y-3">
      <h2 className="text-lg font-semibold">Novo ticket</h2>
      <input className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" />
      <textarea className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" />
      <select className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="LOW">Baixa</option>
        <option value="MEDIUM">Média</option>
        <option value="HIGH">Alta</option>
        <option value="CRITICAL">Crítica</option>
      </select>
      <button className="rounded-lg bg-brand-600 px-4 py-2 font-semibold hover:bg-brand-500">Criar ticket</button>
    </form>
  );
}
