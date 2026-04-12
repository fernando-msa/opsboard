'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthButton } from '@/components/google-auth-button';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', organizationName: '' });
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || 'Erro ao criar conta.');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <form onSubmit={handleSubmit} className="card w-full space-y-4">
        <h1 className="text-2xl font-semibold">Criar conta</h1>
        <input className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Senha" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <input className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Empresa" value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} />
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <button className="w-full rounded-lg bg-brand-600 px-4 py-2 font-semibold hover:bg-brand-500">Criar conta</button>
        <div className="text-center text-xs text-slate-500">ou</div>
        <GoogleAuthButton mode="register" />
      </form>
    </main>
  );
}
