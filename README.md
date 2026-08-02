# Full-Stack TypeScript Boilerplate

> Start with [PROJECT_REFERENCE.md](./PROJECT_REFERENCE.md) for the complete
> architecture, coding conventions, folder structure, and file-by-file
> documentation. It is the primary source of truth for this repository.

A reusable, business-logic-free TypeScript monorepo for building a Next.js web
application and an Express API backed by PostgreSQL.

## Stack

- Node.js 24 LTS and pnpm 11
- Turborepo with `apps/*` and `packages/*` workspaces
- Next.js 16 App Router, React 19, Tailwind CSS 4, and React Compiler
- Express 5, Zod 4, Pino, Helmet, CORS, and rate limiting
- Prisma ORM 7 with the PostgreSQL driver adapter
- PostgreSQL 18.4 through Docker Compose
- Typed ESLint flat configs and a shared Prettier config

## Requirements

- Node.js 24
- pnpm 11 (Corepack is recommended)
- Docker Desktop or another Docker Engine with Compose v2

## First run

```powershell
Copy-Item .env.example .env
Copy-Item apps/web/.env.example apps/web/.env.local
pnpm install --frozen-lockfile
docker compose up -d postgres
pnpm db:generate
pnpm db:migrate:deploy
pnpm db:seed
pnpm dev
```

The web application is available at <http://localhost:3000>. API health checks
are available at:

- `GET http://localhost:4000/api/v1/health/live`
- `GET http://localhost:4000/api/v1/health/ready`
- `GET http://localhost:4000/api/v1/demo/connection`

The home page includes a **Test connection** action that calls the demo endpoint
and reads the seeded `DemoMessage` record through Express, Prisma, and
PostgreSQL.

Example credentials are intentionally local-only. Change them for any shared or
deployed environment and never commit `.env` files.

## Commands

| Command                  | Purpose                                    |
| ------------------------ | ------------------------------------------ |
| `pnpm dev`               | Run all development servers                |
| `pnpm build`             | Build database, API, and web workspaces    |
| `pnpm lint`              | Run typed ESLint checks                    |
| `pnpm check-types`       | Run TypeScript checks                      |
| `pnpm format`            | Format supported source files              |
| `pnpm format:check`      | Verify formatting                          |
| `pnpm db:format`         | Format the Prisma schema                   |
| `pnpm db:validate`       | Validate Prisma configuration and schema   |
| `pnpm db:generate`       | Generate Prisma Client                     |
| `pnpm db:migrate:dev`    | Create and apply a development migration   |
| `pnpm db:migrate:deploy` | Apply pending migrations                   |
| `pnpm db:migrate:reset`  | Reset development data and migrations      |
| `pnpm db:push`           | Prototype schema changes without migration |
| `pnpm db:studio`         | Open Prisma Studio                         |
| `pnpm db:seed`           | Upsert the idempotent demo record          |

`db:migrate:reset` destroys all data in the configured development schema. Do
not run it against a shared or production database. Prisma Studio prints its
local URL when it starts.

## Architecture

```text
apps/
  api/                  Express API and composition root
    src/core/           Configuration, errors, responses, and core types
    src/infrastructure/ Logger and security adapters
    src/middlewares/    Cross-cutting HTTP middleware
    src/modules/        Domain modules (health and demo connection)
  web/                  Next.js App Router application
    src/app/            Routes, layouts, and route-level boundaries
    src/features/       Feature-specific UI and behavior
    src/services/       Generic infrastructure such as API transport
    src/shared/         Truly reusable UI, hooks, types, and utilities
    src/styles/         Global styles and design tokens
packages/
  database/             Compiled Prisma client factory
  eslint-config/        Typed flat ESLint configuration factories
  prettier-config/      Shared formatting policy
  typescript-config/    Shared Node.js and Next.js compiler policies
```

Create feature subdirectories only when they contain real code. Future modules
such as `auth`, `customers`, `projects`, or `payments` belong under the relevant
app's feature/module directory rather than under generic shared code.

## Environment and deployment notes

The API discovers the workspace root before loading `.env`; the database package
itself never reads application environment variables. Its exported factory
requires a validated PostgreSQL connection string. The web app validates only
`NEXT_PUBLIC_*` values and no secret may use that prefix.

`TRUST_PROXY` accepts `false` or an explicit hop count from 1 through 10. Set it
to the actual deployment topology; a blanket `true` value is deliberately
rejected because it can let clients spoof forwarding headers.

The built-in rate-limit memory store is suitable for local development or a
single API instance. Multi-instance production deployments require a shared
store such as Redis. Likewise, production should supply secrets through its
secret manager instead of Compose environment files.

## Production

```powershell
pnpm build
pnpm --filter @template/api start
pnpm --filter @template/web start
```

The API production command executes compiled JavaScript only, with source-map
support. Generated Prisma sources and build outputs are intentionally ignored by
Git and regenerated during database builds and type checks.
