import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-800/80 bg-slate-950/70 px-6 py-8 shadow-2xl shadow-slate-950/40 backdrop-blur md:px-10 lg:px-12 lg:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(96,165,250,0.12),transparent_28%)]" />
        <div className="relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
              Multi-tenant, SLA e status page pública em um único produto
            </div>
            <h1 className="mt-6 max-w-2xl text-5xl font-semibold tracking-tight text-white md:text-6xl">
              Operação clara para vender mais e responder mais rápido.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
              O OpsBoard junta tickets, incidentes, SLA e comunicação pública em um fluxo desenhado para times que precisam provar valor para o cliente sem perder tempo em planilhas.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-brand-400">
                Começar grátis
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-6 py-3.5 font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900/80">
                Entrar
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ['SLA', 'Métricas de resolução e cumprimento em tempo real.'],
                ['Incidentes', 'Registro e atualização com impacto nos serviços.'],
                ['Status Page', 'Página pública por empresa, pronta para o cliente.']
              ].map(([title, description]) => (
                <article key={title} className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4">
                  <h2 className="text-base font-semibold text-white">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-10 h-28 w-28 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute -right-8 bottom-10 h-32 w-32 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/40">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <p className="text-sm text-slate-400">Painel de operação</p>
                  <p className="text-lg font-semibold text-white">OpsBoard Dashboard</p>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Demo ativa
                </span>
              </div>
              <div className="grid gap-4 py-4 sm:grid-cols-2">
                {[
                  ['86.4%', 'Tickets dentro do SLA'],
                  ['4.2h', 'Tempo médio'],
                  ['2', 'Incidentes ativos'],
                  ['14', 'Organizações']
                ].map(([value, label]) => (
                  <article key={label} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-3xl font-semibold text-white">{value}</p>
                    <p className="mt-1 text-sm text-slate-400">{label}</p>
                  </article>
                ))}
              </div>
              <Image
                src="/readme/opsboard-dashboard.png"
                alt="Dashboard do OpsBoard"
                width={1120}
                height={630}
                className="rounded-2xl border border-slate-800 object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {[
          ['Cadastro com organização', 'O onboarding já cria empresa, usuário e serviços padrão.'],
          ['Fluxo operacional fechado', 'Tickets, incidentes e SLA vivem no mesmo contexto.'],
          ['Venda mais confiança', 'Status page pública pronta para compartilhar com o cliente.']
        ].map(([title, description]) => (
          <article key={title} className="card">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="mt-3 leading-7 text-slate-400">{description}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="card">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Fluxo do produto</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Do registro ao cliente final, sem sair da plataforma.</h2>
          <ol className="mt-6 space-y-4">
            {[
              'O usuário entra e já ganha uma organização isolada.',
              'O dashboard concentra tickets, SLA e incidentes.',
              'A operação atualiza o estado dos serviços em tempo real.',
              'A status page pública comunica o cliente com transparência.'
            ].map((item, index) => (
              <li key={item} className="flex gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/15 font-semibold text-brand-300">
                  {index + 1}
                </span>
                <p className="text-slate-300">{item}</p>
              </li>
            ))}
          </ol>
        </article>

        <article className="card overflow-hidden p-0">
          <div className="border-b border-slate-800 px-5 py-4">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Prova visual</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Status page e operação lado a lado</h2>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              <Image src="/readme/opsboard-status-page.png" alt="Status page pública do OpsBoard" width={640} height={360} className="rounded-xl" />
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              <Image src="/readme/opsboard-demo.gif" alt="GIF demonstrando o OpsBoard" width={640} height={360} className="rounded-xl" unoptimized />
            </div>
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {[
          ['Segurança', 'Sessão em cookie HTTP-only, validação de payload e isolamento por organização.'],
          ['Escala', 'Next.js, Prisma e PostgreSQL prontos para crescer sem refatoração traumática.'],
          ['Demonstração', 'Seed demo e assets visuais ajudam a vender o produto já na primeira conversa.']
        ].map(([title, description]) => (
          <article key={title} className="card">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-3 leading-7 text-slate-400">{description}</p>
          </article>
        ))}
      </section>

      <section className="my-8 rounded-[2rem] border border-slate-800/80 bg-slate-900/70 px-6 py-8 text-center shadow-2xl shadow-slate-950/30">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Pronto para testar</p>
        <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Comece com a conta demo ou crie sua própria organização.</h2>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/register" className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-brand-400">
            Criar conta
          </Link>
          <Link href="/login" className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-6 py-3.5 font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900/80">
            Entrar na demo
          </Link>
        </div>
      </section>
    </main>
  );
}
