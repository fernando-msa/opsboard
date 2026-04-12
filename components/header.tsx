'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Header({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold">OpsBoard</h1>
        <p className="text-sm text-slate-400">Monitoramento de SLA e incidentes</p>
      </div>
      <div className="flex gap-2">
        <Link className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800" href={`/status/${orgSlug}`}>
          Status page pública
        </Link>
        <Link className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800" href="/incidents">
          Incidentes
        </Link>
        <button onClick={logout} className="rounded-lg bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">
          Sair
        </button>
      </div>
    </header>
  );
}
