'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthButton } from '@/components/google-auth-button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      setError('Credenciais inválidas.');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <form onSubmit={handleSubmit} className="card w-full space-y-4">
        <h1 className="text-2xl font-semibold">Entrar no OpsBoard</h1>
        <input className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <button className="w-full rounded-lg bg-brand-600 px-4 py-2 font-semibold hover:bg-brand-500">Entrar</button>
        <div className="text-center text-xs text-slate-500">ou</div>
        <GoogleAuthButton mode="login" />
      </form>
    </main>
  );
}
