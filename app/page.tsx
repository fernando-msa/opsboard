import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold md:text-5xl">OpsBoard</h1>
      <p className="mt-4 max-w-2xl text-slate-300">
        Plataforma SaaS B2B para monitoramento de SLA, incidentes e status page pública.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/register" className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold hover:bg-brand-500">
          Começar grátis
        </Link>
        <Link href="/login" className="rounded-lg border border-slate-700 px-5 py-2.5 font-semibold hover:bg-slate-800">
          Entrar
        </Link>
      </div>
    </main>
  );
}
