# OpsBoard

> B2B SaaS platform for SLA monitoring, incident management, and public status pages with multi-tenant architecture.

![Security Audit](https://img.shields.io/badge/security-audit-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Tech Stack

| Layer          | Technology                                     |
| -------------- | ---------------------------------------------- |
| Framework      | Next.js 16 (App Router, API Routes)            |
| Language       | TypeScript 5.7                                 |
| Frontend       | React 19, TailwindCSS                          |
| Database       | PostgreSQL, Prisma ORM                         |
| Authentication | Custom JWT (jose) + Firebase Auth (Google SSO) |
| Deployment     | Render (Blueprint)                             |

## Architecture

OpsBoard follows a **multi-tenant** architecture where every organization is isolated at the database level. All queries are scoped by `organizationId`, preventing cross-tenant data access.

- **Server Components** handle data fetching (dashboard, incidents, status pages) via Prisma queries executed on the server.
- **Client Components** manage interactive UI (forms, tables, lists) and communicate with API routes via `fetch`.
- **API Routes** under `/api` provide a REST layer with JWT-based authentication (HTTP-only cookies) and input validation.
- **Public Status Pages** at `/status/:slug` expose a read-only view of services and recent incidents per organization.

## Features

- JWT authentication with HTTP-only cookies and Google SSO via Firebase Auth
- Multi-tenant organization isolation (all queries scoped by `organizationId`)
- Ticket management with SLA tracking (priority-based deadlines)
- Incident management with automatic service status propagation
- Public status pages per organization (`/status/:slug`)
- SLA dashboard with average resolution time and compliance percentage
- Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- Input validation on all API endpoints
- Automated security audit pipeline (Dependabot + npm audit gate)
- 18 automated tests (Vitest)

## Project Structure

```
app/
  api/
    auth/          # Authentication endpoints (login, register, logout, Google SSO)
    incidents/     # Incident CRUD
    tickets/       # Ticket CRUD
    services/      # Service listing
    sla/           # SLA metrics
    me/            # Current session
    health/        # Health check endpoint
  dashboard/       # SLA dashboard (server component)
  incidents/       # Incident management page
  login/           # Login form
  register/        # Registration form
  status/[slug]/   # Public status page per organization
components/        # Reusable UI components
lib/
  auth.ts          # JWT sign/verify, cookie management
  constants.ts     # Shared constants (priority hours, status labels)
  firebase-admin.ts# Firebase Admin SDK initialization
  firebase-client.ts# Firebase client SDK
  prisma.ts        # Prisma client singleton
  sla.ts           # SLA metrics calculation
  slugify.ts       # URL slug generation
middleware.ts      # Next.js route protection
prisma/
  schema.prisma    # Database schema (5 models, 3 enums)
  seed.ts          # Demo data seeder
  validate-seed.ts # Seed validation script
docs/
  security-remediation-report.md
  demo-validation-report.md
.github/
  workflows/security-audit.yml
  dependabot.yml
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL

### Installation

```bash
git clone <repository-url>
cd opsboard
cp .env.example .env    # configure DATABASE_URL, JWT_SECRET
npm install
npx prisma migrate deploy
npm run prisma:seed      # optional: load demo data
npm run dev
```

The application will be available at `http://localhost:3000`.

### Environment Variables

| Variable                        | Description                          | Required |
| ------------------------------- | ------------------------------------ | -------- |
| `DATABASE_URL`                  | PostgreSQL connection string         | Yes      |
| `JWT_SECRET`                    | Secret for JWT signing (32+ chars)   | Yes      |
| `PORT`                          | Server port (default: 3000)          | No       |
| `NEXT_PUBLIC_FIREBASE_*`       | Firebase client configuration        | No       |
| `FIREBASE_PROJECT_ID`          | Firebase Admin project ID            | No       |
| `FIREBASE_CLIENT_EMAIL`        | Firebase Admin client email          | No       |
| `FIREBASE_PRIVATE_KEY`         | Firebase Admin private key           | No       |

## API Reference

| Endpoint               | Method   | Auth | Description                    |
| ---------------------- | -------- | ---- | ------------------------------ |
| `/api/auth/register`   | POST     | No   | Create account and organization|
| `/api/auth/login`      | POST     | No   | Email/password login           |
| `/api/auth/logout`     | POST     | No   | Clear session cookie           |
| `/api/auth/google`     | POST     | No   | Google SSO login               |
| `/api/me`              | GET      | Yes  | Current session info           |
| `/api/tickets`         | GET/POST | Yes  | List/create tickets            |
| `/api/tickets/:id`     | PUT/DEL  | Yes  | Update/delete ticket           |
| `/api/incidents`       | GET/POST | Yes  | List/create incidents          |
| `/api/incidents/:id`   | PUT/DEL  | Yes  | Update/delete incident         |
| `/api/services`        | GET      | Yes  | List organization services     |
| `/api/sla`             | GET      | Yes  | SLA metrics                    |
| `/api/health`          | GET      | No   | Health check                   |

## Data Model

- **Organization** — Top-level tenant with a unique slug
- **User** — Belongs to an organization, has email/password or Google auth
- **Ticket** — Support ticket with priority-based SLA deadlines
- **Incident** — Service incident with status tracking
- **Service** — Organization service shown on the public status page

Enums: `TicketStatus` (OPEN, IN_PROGRESS, RESOLVED, CLOSED), `TicketPriority` (LOW, MEDIUM, HIGH, CRITICAL), `ServiceStatus` (OPERATIONAL, DEGRADED, DOWN)

## Security

- Route protection via Next.js middleware (unauthenticated users redirected to `/login`)
- Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Input validation on all API endpoints with descriptive error responses
- Organization-scoped queries prevent cross-tenant data access (including `updateMany` for service status)
- Generic error messages prevent information leakage
- HTTP-only cookies with `sameSite: lax` and `secure` in production
- Passwords hashed with bcrypt (cost factor 10)
- Automated CI/CD security audit with high/critical vulnerability gate
- Dependabot enabled for dependency vulnerability monitoring

## Testing

```bash
npm test           # run all tests
npm run test:watch # watch mode
```

Test coverage includes:
- `lib/slugify.test.ts` — URL slug generation (7 tests)
- `lib/sla.test.ts` — SLA metrics calculation (6 tests)
- `lib/constants.test.ts` — Shared constants validation (5 tests)

## License

MIT — Fernando S. De Santana Junior
