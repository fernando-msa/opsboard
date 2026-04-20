'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthButton } from '@/components/google-auth-button';

const demoAccounts = [
  { email: 'admin@demo.com', role: 'Admin' },
  { email: 'suporte@demo.com', role: 'Suporte' },
  { email: 'ops@demo.com', role: 'Ops' }
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleQuickLogin(quickEmail: string) {
    setIsLoading(true);
    setError('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: quickEmail, password: 'demo1234' })
    });

    if (!response.ok) {
      setError('Falha no login. Tente novamente.');
      setIsLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      setError('Credenciais inválidas.');
      setIsLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-6">
      <div className="w-full space-y-6">
        {/* Demo Mode Alert */}
        <div className="rounded-lg border-2 border-blue-500 bg-blue-950 p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <h2 className="text-lg font-bold text-blue-200">Modo Demo - Acesso Rápido</h2>
          </div>
          <p className="mb-4 text-sm text-blue-300">Clique em uma conta abaixo para entrar instantaneamente:</p>
          
          <div className="grid gap-2 md:grid-cols-3">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => handleQuickLogin(account.email)}
                disabled={isLoading}
                className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
              >
                <div className="font-bold">{account.role}</div>
                <div className="text-xs text-blue-200">{account.email}</div>
              </button>
            ))}
          </div>
          
          <div className="mt-4 rounded bg-blue-900 px-3 py-2 text-xs text-blue-200">
            <strong>Senha para todas as contas:</strong> <code className="font-mono">demo1234</code>
          </div>
        </div>

        {/* Traditional Login Form */}
        <form onSubmit={handleSubmit} className="card w-full space-y-4">
          <h1 className="text-2xl font-semibold">Ou faça login aqui</h1>
          
          <div>
            <label className="mb-1 block text-xs text-slate-400">E-mail</label>
            <input 
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" 
              placeholder="seu@email.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="mb-1 block text-xs text-slate-400">Senha</label>
            <input 
              type="password" 
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full rounded-lg bg-brand-600 px-4 py-2 font-semibold hover:bg-brand-500 disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
          
          <div className="text-center text-xs text-slate-500">ou</div>
          <GoogleAuthButton mode="login" />
        </form>
      </div>
    </main>
  );
}
