# OpsBoard

SaaS B2B para monitoramento de **SLA**, **incidentes** e **status page pública**, com arquitetura multi-tenant.

## ✨ Funcionalidades do MVP

- **Autenticação JWT** (registro, login, logout) com cookie HTTP-only.
- **Multi-tenant por organização** (cada usuário pertence a uma empresa).
- **Criação de organização no registro** + serviços padrão para status page.
- **CRUD de tickets** (API + UI):
  - título
  - descrição
  - status
  - prioridade
  - data de abertura (`createdAt`)
  - data de resolução (`resolvedAt`)
- **SLA Dashboard**:
  - tempo médio de atendimento
  - % de tickets dentro do prazo
- **Incidentes manuais** com criação, atualização e exclusão:
  - operacional
  - degradado
  - fora do ar
- **Status Page pública por empresa** (`/status/:slug`).
- **UI estilo SaaS** com cards de métricas e tabela de tickets.

---

## 🧱 Stack

- **Next.js 14** (App Router + API Routes)
- **TypeScript**
- **PostgreSQL**
- **Prisma ORM**
- **TailwindCSS**

---

## 📁 Estrutura do projeto

```bash
.
├── app/
│   ├── api/                # Endpoints REST (auth, tickets, incidentes, SLA)
│   ├── dashboard/          # Dashboard interno
│   ├── incidents/          # Gestão de incidentes
│   ├── login/              # Tela de login
│   ├── register/           # Tela de cadastro
│   └── status/[slug]/      # Status page pública por organização
├── components/             # Componentes de UI
├── lib/                    # Helpers (auth JWT, prisma, SLA)
├── prisma/
│   ├── migrations/         # Migração inicial
│   ├── schema.prisma       # Modelagem completa
│   └── seed.ts             # Seed demo
├── render.yaml             # Config para deploy no Render
└── README.md
```

---

## 🗃️ Modelagem Prisma

Entidades principais:

- `Organization`
- `User`
- `Ticket`
- `Incident`
- `Service`

Enums:

- `TicketStatus`
- `TicketPriority`
- `ServiceStatus`

Relações:

- Uma organização possui vários usuários, tickets, incidentes e serviços.
- Todo ticket/incidente é isolado por `organizationId`.
- Status page usa `slug` único por organização.

---

## 🚀 Como rodar localmente

### 1) Pré-requisitos

- Node.js 20+
- PostgreSQL

### 2) Configurar variáveis

```bash
cp .env.example .env
```

Ajuste os valores no `.env`:

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`

### 3) Instalar dependências

```bash
npm install
```

### 4) Rodar migrações

```bash
npx prisma migrate deploy
```

### 5) (Opcional) Carregar dados demo

```bash
npm run prisma:seed
```

### 6) Iniciar aplicação

```bash
npm run dev
```

Aplicação disponível em `http://localhost:3000`.

---

## 🧪 Conta demo (seed)

- **Email:** `admin@demo.com`
- **Senha:** `demo1234`

> Observação: essa conta só existe após executar `npm run prisma:seed`.

---

## 🌐 Deploy no Render

O projeto já inclui `render.yaml` pronto.

### Passo a passo

1. Faça push do repositório no GitHub.
2. No Render, clique em **New + > Blueprint**.
3. Conecte o repositório.
4. Configure as variáveis de ambiente:
   - `DATABASE_URL`
   - `JWT_SECRET`
5. O Render executará:
   - `yarn install && yarn build`
   - `npm run start` (o script `start` executa `prisma migrate deploy` antes de iniciar o Next.js)

> O start usa `process.env.PORT` automaticamente via script: `next start -p ${PORT:-3000}`.

---


## 🛠️ Troubleshooting Render (`P1012: DATABASE_URL not found`)

Se aparecer no log:

`Environment variable not found: DATABASE_URL`

siga este passo a passo completo:

### 1) Criar banco PostgreSQL no Render

1. No painel do Render, clique em **New +**.
2. Escolha **PostgreSQL**.
3. Crie o banco na mesma região do serviço web.
4. Após provisionar, abra o banco e copie a **Internal Database URL**.

### 2) Configurar variáveis no serviço Web

1. Abra seu serviço Web (`opsboard`).
2. Vá em **Environment**.
3. Crie/valide as variáveis:
   - `DATABASE_URL` → cole a Internal Database URL do Postgres.
   - `JWT_SECRET` → gere um valor forte (mínimo 32+ caracteres).
   - (opcional) variáveis Firebase (`NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_*`).
4. Clique em **Save Changes**.

### 3) Fazer deploy limpo

1. Abra a aba **Manual Deploy**.
2. Clique em **Clear build cache & deploy**.
3. Aguarde o deploy finalizar.

### 4) Validar no log que está correto

No startup você deve ver algo como:

- `[OpsBoard] DATABASE_URL encontrado. Aplicando migrations...`
- Em seguida o Next iniciando normalmente.

Se aparecer:

- `[OpsBoard] AVISO: DATABASE_URL não definido...`

então a variável ainda não está disponível no serviço (ou foi salva no serviço errado).

### 5) Testes rápidos pós-deploy

1. Acesse `/register` e crie conta.
2. Faça login em `/login`.
3. Confirme que `/dashboard` abre sem erro.

### 6) (Opcional) carregar dados demo

Se quiser dados de demonstração (`admin@demo.com`), execute seed uma vez no ambiente com banco configurado.

Com a versão atual, o start script evita crash imediato quando `DATABASE_URL` não existe, mas **as funcionalidades que dependem de banco só funcionam após configurar `DATABASE_URL`**.

---

## 🔒 Segurança

- Framework atualizado para **Next.js 16.0.10** (com React 19.2.0) para mitigar os advisories ativos detectados pelo Dependabot.
- Recomendado manter Dependabot habilitado e aplicar updates de segurança com prioridade alta/moderada.
- Em Next.js 16, mantenha apenas `proxy.ts` (sem `middleware.ts`). O script `prebuild` já remove `middleware.ts` caso exista em cache antigo.

---

## 🔥 Firebase (Google Auth + Firestore)

O projeto suporta autenticação com Google via Firebase Auth e grava eventos de autenticação no Firestore (`auth_events`).

### Variáveis necessárias

- Frontend (`NEXT_PUBLIC_*`):
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
  - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- Backend (Firebase Admin):
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`

- Se as variáveis `NEXT_PUBLIC_FIREBASE_*` não estiverem definidas, o botão Google aparece desativado (sem quebrar build/deploy).

> Dica: para `FIREBASE_PRIVATE_KEY`, mantenha as quebras de linha escapadas (`\n`) no provider de env vars.

---

### Ativar Google Auth no Render (checklist rápido)

1. No Firebase Console, habilite **Authentication > Sign-in method > Google**.
2. Em **Authentication > Settings > Authorized domains**, adicione seu domínio do Render (`*.onrender.com`) e domínio custom se houver.
3. No Render (Web Service > Environment), configure:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (opcional)
4. Para o backend, use **uma** das opções:
   - Opção A (recomendada): `FIREBASE_SERVICE_ACCOUNT_JSON` com o JSON completo da service account.
   - Opção B: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
5. Faça **Manual Deploy > Clear build cache & deploy**.
6. Teste em `/login` clicando em **Entrar com Google**.

> Se o botão aparecer desativado, faltam variáveis `NEXT_PUBLIC_FIREBASE_*` no serviço web.

---

## 📌 Endpoints principais

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/google`
- `GET /api/me`
- `GET/POST /api/tickets`
- `PUT/DELETE /api/tickets/:id`
- `GET/POST /api/incidents`
- `PUT/DELETE /api/incidents/:id`
- `GET /api/services`
- `GET /api/sla`

---

## 🔮 Próximos passos sugeridos

- RBAC (Owner/Admin/Agent).
- Notificações (e-mail/Slack) em incidentes.
- Integração com monitoramento real (Ping, APM, Uptime checks).
- Histórico de auditoria.
- Webhooks para incident lifecycle.

