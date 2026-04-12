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


## 🔒 Segurança

- Framework atualizado para **Next.js 14.2.35** para mitigar advisories conhecidos da linha 14.x detectados pelo Dependabot.
- Recomendado manter Dependabot habilitado e aplicar updates de segurança com prioridade alta/moderada.

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

