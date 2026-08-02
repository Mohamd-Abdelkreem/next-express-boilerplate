# Full-Stack Boilerplate Project Reference

This document is the primary architectural reference for this repository. It
describes the coding conventions, request flow, current folder structure, every
source-controlled file, and the canonical locations for future features.

When code and this document disagree, update both in the same change.

## 1. Architecture principles

- The repository is a pnpm workspace orchestrated by Turborepo.
- `apps/web` owns browser and Next.js concerns.
- `apps/api` owns HTTP composition and application modules.
- `packages/database` owns Prisma generation and database client creation.
- Shared configuration packages contain policy only; they contain no business
  logic.
- A controller handles HTTP details, a service handles application logic, and a
  route connects middleware to a controller.
- Dependencies are created in the composition root and injected into services.
- Files and directories are created only when they contain real behavior. Empty
  architecture placeholders are not allowed.

## 2. Runtime request flow

```text
Browser / API consumer
  ↓
Route
  ↓
Validation middleware
  ↓
Authentication / authorization middleware (when the module requires it)
  ↓
Controller
  ↓
Service
  ↓
Prisma client or infrastructure service
  ↓
Controller
  ↓
ResponseHelper
  ↓
Consistent HTTP response
```

### Route

Defines the endpoint and attaches middleware and controller methods. A route
must not contain business logic.

### Controller

Reads request data, calls a service, sets HTTP headers or cookies when needed,
and returns a response through `ResponseHelper`.

### Service

Contains application logic, calls Prisma or infrastructure services, throws
application errors, and returns controller-ready data.

### Schema

Validates every external input before it reaches a controller. Module-specific
schemas stay inside that module; reusable schemas belong in
`src/shared/validators`.

### Types and constants

Module-only types and constants stay beside the module. Cross-cutting types and
constants belong under `src/core` or `src/shared`, depending on whether they
are required by the application core or are optional helpers.

## 3. Current repository structure

```text
.
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── core/
│   │   │   │   ├── config/
│   │   │   │   ├── constants/
│   │   │   │   ├── errors/
│   │   │   │   ├── responses/
│   │   │   │   └── types/
│   │   │   ├── infrastructure/
│   │   │   │   └── logger/
│   │   │   ├── middlewares/
│   │   │   ├── modules/
│   │   │   │   ├── demo/
│   │   │   │   └── health/
│   │   │   ├── app.ts
│   │   │   ├── router.ts
│   │   │   └── server.ts
│   │   ├── eslint.config.mjs
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsconfig.build.json
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   ├── config/
│       │   ├── features/
│       │   ├── services/
│       │   └── styles/
│       ├── .env.example
│       ├── eslint.config.mjs
│       ├── next.config.ts
│       ├── package.json
│       ├── postcss.config.mjs
│       └── tsconfig.json
├── packages/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── migrations/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   ├── eslint-config/
│   ├── prettier-config/
│   └── typescript-config/
├── .env.example
├── compose.yaml
├── package.json
├── pnpm-workspace.yaml
├── prettier.config.mjs
├── turbo.json
└── README.md
```

## 4. API coding conventions

### Environment and configuration

`core/config/env.ts` is the only file that reads raw environment variables.
It loads the workspace root `.env` outside production and exposes strict
string, number, boolean, and integer readers. Domain configuration files consume
those readers and export immutable configuration objects.

Do not access `process.env` from controllers, services, middleware, or
infrastructure code.

### Errors

Every intentional application error extends `AppError` and contains:

- a public message;
- an HTTP status code;
- a stable application code;
- an operational flag;
- optional field errors;
- a timestamp.

Expected failures are operational. Unexpected failures become
`InternalServerError`, are logged with their original error, and do not expose
internal details in production.

### API responses

Successful responses are created by `ResponseHelper`. Error responses are
created only by the global error handler. Both include:

```text
success
statusCode
message
data
requestId
timestamp
path
```

Errors additionally include `code`, optional field-level `errors`, and a
development-only stack.

### Naming

- Config files: `<concern>.config.ts`
- Error files: `<name>.error.ts`
- Middleware files: `<name>.middleware.ts`
- Module files: `<module>.controller.ts`, `<module>.service.ts`,
  `<module>.routes.ts`, `<module>.schema.ts`, `<module>.types.ts`, and
  `<module>.constants.ts`
- Barrel files: `index.ts`, exposing only public module APIs

### Imports

Use relative imports inside an application and workspace package imports across
packages. Node.js ESM imports include the emitted `.js` extension. Use
`import type` for type-only dependencies.

## 5. Rules for adding a module

Create a business module inside:

```text
apps/api/src/modules/<module-name>/
```

Use only the files the module actually needs:

```text
<module-name>/
├── <module-name>.controller.ts
├── <module-name>.service.ts
├── <module-name>.routes.ts
├── <module-name>.schema.ts
├── <module-name>.types.ts
├── <module-name>.constants.ts
└── index.ts
```

Then instantiate its service and controller in `apps/api/src/router.ts`, mount
its routes, and export its public API from `apps/api/src/modules/index.ts`.

Do not pre-create auth, users, products, payments, or any other business module
until the project requires it.

## 6. Canonical API growth structure

The following is the approved destination structure as the application grows.
Entries marked future are not created until they contain real implementation.

```text
apps/api/
├── src/
│   ├── modules/
│   │   ├── <module-name>/
│   │   │   ├── <module-name>.controller.ts  HTTP-only handling
│   │   │   ├── <module-name>.service.ts     Application/business logic
│   │   │   ├── <module-name>.routes.ts      Route and middleware wiring
│   │   │   ├── <module-name>.schema.ts      Request validation
│   │   │   ├── <module-name>.types.ts       Module-owned types
│   │   │   ├── <module-name>.constants.ts   Module-owned constants
│   │   │   └── index.ts                     Public module API
│   │   └── index.ts                         Public APIs for all modules
│   ├── core/
│   │   ├── config/
│   │   │   ├── env.ts                       Raw environment access
│   │   │   ├── app.config.ts                Host, port, prefix, timeouts
│   │   │   ├── auth.config.ts               Future token/password settings
│   │   │   ├── cors.config.ts               Allowed origins and credentials
│   │   │   ├── cookie.config.ts             Future cookie policy
│   │   │   ├── database.config.ts           Database connection settings
│   │   │   ├── logger.config.ts             Logger level and mode
│   │   │   ├── mail.config.ts               Future mail provider settings
│   │   │   ├── cache.config.ts              Future cache settings
│   │   │   ├── storage.config.ts            Future storage settings
│   │   │   ├── queue.config.ts              Future queue settings
│   │   │   ├── rate-limit.config.ts         Request limit settings
│   │   │   └── index.ts                     Public configuration API
│   │   ├── errors/
│   │   │   ├── app.error.ts
│   │   │   ├── bad-request.error.ts
│   │   │   ├── validation.error.ts
│   │   │   ├── unauthorized.error.ts
│   │   │   ├── forbidden.error.ts
│   │   │   ├── not-found.error.ts
│   │   │   ├── conflict.error.ts
│   │   │   ├── too-many-requests.error.ts
│   │   │   ├── internal-server.error.ts
│   │   │   ├── service-unavailable.error.ts
│   │   │   └── index.ts
│   │   ├── responses/
│   │   │   ├── api-response.ts
│   │   │   └── index.ts
│   │   ├── constants/
│   │   │   ├── app.constants.ts             Future app-wide values
│   │   │   ├── http-status.constants.ts      HTTP status codes
│   │   │   ├── headers.constants.ts          Future header names
│   │   │   ├── pagination.constants.ts       Future pagination defaults
│   │   │   ├── regex.constants.ts            Future reusable patterns
│   │   │   ├── security.constants.ts         Future security values
│   │   │   └── index.ts
│   │   └── types/
│   │       ├── express.d.ts                   Express Request augmentation
│   │       ├── api.types.ts                  Future shared API types
│   │       ├── pagination.types.ts           Future pagination contracts
│   │       ├── environment.types.ts          Future environment contracts
│   │       ├── request-context.types.ts       Request user/context types
│   │       └── index.ts
│   ├── middlewares/
│   │   ├── authentication.middleware.ts      Future token authentication
│   │   ├── authorization.middleware.ts       Future role/permission checks
│   │   ├── validation.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   ├── request-id.middleware.ts
│   │   ├── request-logger.middleware.ts
│   │   ├── timeout.middleware.ts             Future per-request timeout
│   │   ├── not-found.middleware.ts
│   │   ├── error-handler.middleware.ts
│   │   └── index.ts
```

```text
apps/api/
├── src/
│   ├── infrastructure/
│   │   ├── cache/                              Future Redis/cache integration
│   │   │   ├── redis.client.ts
│   │   │   ├── cache.service.ts
│   │   │   ├── cache.types.ts
│   │   │   └── index.ts
│   │   ├── mail/                               Future mail implementation
│   │   │   ├── mail.service.ts
│   │   │   ├── mail.types.ts
│   │   │   ├── mail.constants.ts
│   │   │   ├── templates/
│   │   │   │   ├── verification-email.template.ts
│   │   │   │   ├── password-reset.template.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── storage/                            Future file storage
│   │   │   ├── storage.service.ts
│   │   │   ├── storage.types.ts
│   │   │   ├── storage.constants.ts
│   │   │   ├── local-storage.provider.ts
│   │   │   ├── s3-storage.provider.ts
│   │   │   ├── cloudinary-storage.provider.ts
│   │   │   └── index.ts
│   │   ├── queue/                              Future background jobs
│   │   │   ├── queue.client.ts
│   │   │   ├── queue.service.ts
│   │   │   ├── queue.types.ts
│   │   │   ├── producers/
│   │   │   │   ├── email.producer.ts
│   │   │   │   └── index.ts
│   │   │   ├── workers/
│   │   │   │   ├── email.worker.ts
│   │   │   │   └── index.ts
│   │   │   ├── jobs/
│   │   │   │   ├── send-email.job.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── scheduler/                          Future recurring jobs
│   │   │   ├── scheduler.ts
│   │   │   ├── cleanup-expired-sessions.job.ts
│   │   │   ├── cleanup-expired-tokens.job.ts
│   │   │   └── index.ts
│   │   ├── security/                           Future security services
│   │   │   ├── password-hasher.ts
│   │   │   ├── token.service.ts
│   │   │   ├── encryption.service.ts
│   │   │   ├── otp.service.ts
│   │   │   └── index.ts
│   │   ├── logger/
│   │   │   ├── logger.ts
│   │   │   ├── logger.types.ts                 Future logger context types
│   │   │   ├── logger.serializers.ts           Future redaction serializers
│   │   │   └── index.ts
│   │   ├── docs/                               Future OpenAPI integration
│   │   │   ├── openapi.ts
│   │   │   ├── swagger.ts
│   │   │   └── index.ts
│   │   └── external-services/
│   │       ├── payment/                        Future provider abstraction
│   │       │   ├── payment-gateway.service.ts
│   │       │   ├── payment-gateway.types.ts
│   │       │   ├── stripe.provider.ts
│   │       │   ├── tap.provider.ts
│   │       │   └── index.ts
│   │       └── index.ts
│   ├── shared/
│   │   ├── utils/
│   │   │   ├── async-handler.util.ts           Future async wrapper if needed
│   │   │   ├── pagination.util.ts
│   │   │   ├── date.util.ts
│   │   │   ├── string.util.ts
│   │   │   ├── object.util.ts
│   │   │   ├── cookie.util.ts
│   │   │   ├── request.util.ts
│   │   │   └── index.ts
│   │   └── validators/
│   │       ├── common.schema.ts
│   │       ├── pagination.schema.ts
│   │       ├── identifier.schema.ts
│   │       ├── email.schema.ts
│   │       ├── password.schema.ts
│   │       └── index.ts
│   ├── app.ts                                  Express configuration only
│   ├── router.ts                               Module composition and mounting
│   └── server.ts                               Startup and graceful shutdown
├── tests/
│   ├── unit/
│   │   ├── modules/
│   │   ├── middlewares/
│   │   ├── infrastructure/
│   │   └── shared/
│   ├── integration/
│   ├── e2e/
│   ├── factories/
│   ├── fixtures/
│   ├── mocks/
│   ├── helpers/
│   └── setup/
│       ├── global.setup.ts
│       ├── integration.setup.ts
│       └── e2e.setup.ts
├── scripts/
│   ├── create-admin.ts
│   ├── cleanup.ts
│   └── check-env.ts
├── tsconfig.json
├── tsconfig.build.json
├── eslint.config.mjs
├── vitest.config.ts
├── package.json
└── README.md
```

### Future infrastructure responsibilities

- `cache`: owns the Redis client and reusable cache operations.
- `mail`: owns provider-independent email sending and templates.
- `storage`: owns file storage interfaces and provider adapters.
- `queue`: owns queue clients, job contracts, producers, and workers.
- `scheduler`: owns scheduled and recurring background work.
- `security`: owns password hashing, signed tokens, encryption, and OTP logic.
- `logger`: owns structured logging, context types, and sensitive-data
  redaction.
- `docs`: owns OpenAPI generation and Swagger registration.
- `external-services`: owns third-party provider abstractions.
- `shared/utils`: contains small provider-free helpers.
- `shared/validators`: contains schemas reused by multiple modules.

### Future tests and scripts

- `tests/unit`: isolated behavior with mocked dependencies.
- `tests/integration`: multiple components using real test dependencies.
- `tests/e2e`: real HTTP flows through the complete application.
- `tests/factories`: customizable test entity builders.
- `tests/fixtures`: fixed reusable test data.
- `tests/mocks`: external provider and infrastructure doubles.
- `tests/helpers`: common test operations.
- `tests/setup`: suite-specific global preparation.
- `scripts`: manually invoked administrative or maintenance commands.

## 7. Current API file reference

### API package entry files

| File                           | Responsibility                                                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/src/app.ts`          | Creates the Express application, registers global middleware, mounts the versioned API router, and registers final not-found/error middleware. It never starts the HTTP server. |
| `apps/api/src/router.ts`       | Composition root for modules. It creates services and controllers from shared dependencies and mounts module routers.                                                           |
| `apps/api/src/server.ts`       | Connects the database, starts HTTP listening, configures Node server timeouts, handles process failures and signals, and closes resources gracefully.                           |
| `apps/api/package.json`        | Declares API runtime dependencies, development tools, and dev/build/start/lint/typecheck scripts.                                                                               |
| `apps/api/tsconfig.json`       | Strict development and type-checking configuration for API source files.                                                                                                        |
| `apps/api/tsconfig.build.json` | Production TypeScript emit configuration for `dist`.                                                                                                                            |
| `apps/api/eslint.config.mjs`   | Activates the shared typed Node.js ESLint policy for the API.                                                                                                                   |

### API configuration

| File                                            | Responsibility                                                                                                                     |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/src/core/config/env.ts`               | Loads the root development `.env` and exposes strict environment readers. This is the only API file allowed to read `process.env`. |
| `apps/api/src/core/config/app.config.ts`        | Builds immutable application settings: name, environment, host, port, API prefix, body limit, trust proxy, and server timeouts.    |
| `apps/api/src/core/config/cors.config.ts`       | Parses and validates allowed CORS origins and the credential policy.                                                               |
| `apps/api/src/core/config/database.config.ts`   | Validates the PostgreSQL connection URL and exports database settings.                                                             |
| `apps/api/src/core/config/logger.config.ts`     | Validates and exports the Pino log level.                                                                                          |
| `apps/api/src/core/config/rate-limit.config.ts` | Exports the global API rate-limit window and maximum request count.                                                                |
| `apps/api/src/core/config/index.ts`             | Public barrel for validated API configuration.                                                                                     |

### API core constants, responses, and types

| File                                                   | Responsibility                                                                                                           |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `apps/api/src/core/constants/http-status.constants.ts` | Named HTTP status values used by controllers, errors, and middleware.                                                    |
| `apps/api/src/core/constants/index.ts`                 | Public barrel for core constants.                                                                                        |
| `apps/api/src/core/responses/api-response.ts`          | Defines response, pagination, and field-error contracts plus the static `ResponseHelper` convention used by controllers. |
| `apps/api/src/core/responses/index.ts`                 | Public barrel for response helpers and types.                                                                            |
| `apps/api/src/core/types/express.d.ts`                 | Augments `Express.Request` with request ID, optional authenticated user, and validated request data.                     |
| `apps/api/src/core/types/request-context.types.ts`     | Defines the framework-independent authenticated-user and validated-data contracts used by the Express augmentation.      |
| `apps/api/src/core/types/index.ts`                     | Public barrel for core request context types.                                                                            |

### API errors

| File                                                    | Responsibility                                                                                          |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `apps/api/src/core/errors/app.error.ts`                 | Base operational error containing message, status, code, field errors, operational flag, and timestamp. |
| `apps/api/src/core/errors/bad-request.error.ts`         | Represents malformed or invalid client requests (400).                                                  |
| `apps/api/src/core/errors/validation.error.ts`          | Represents request validation failures with field-level errors (400).                                   |
| `apps/api/src/core/errors/unauthorized.error.ts`        | Represents missing or invalid authentication (401).                                                     |
| `apps/api/src/core/errors/forbidden.error.ts`           | Represents insufficient permission or rejected origins (403).                                           |
| `apps/api/src/core/errors/not-found.error.ts`           | Represents missing resources and unmatched routes (404).                                                |
| `apps/api/src/core/errors/conflict.error.ts`            | Represents a conflict with existing state (409).                                                        |
| `apps/api/src/core/errors/too-many-requests.error.ts`   | Represents rate-limit rejection (429).                                                                  |
| `apps/api/src/core/errors/internal-server.error.ts`     | Represents unexpected, non-operational failures (500).                                                  |
| `apps/api/src/core/errors/service-unavailable.error.ts` | Represents unavailable dependencies or services (503).                                                  |
| `apps/api/src/core/errors/index.ts`                     | Public barrel for all application error classes.                                                        |

### API middleware

| File                                                    | Responsibility                                                                                                           |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `apps/api/src/middlewares/request-id.middleware.ts`     | Accepts a safe incoming request ID or generates a UUID, attaches it to the request, and returns it as a response header. |
| `apps/api/src/middlewares/request-logger.middleware.ts` | Creates the Pino HTTP middleware and adds request/user context to structured logs.                                       |
| `apps/api/src/middlewares/validation.middleware.ts`     | Parses body, query, and params with Zod and stores validated data on the request. Zod errors flow to the global handler. |
| `apps/api/src/middlewares/rate-limit.middleware.ts`     | Applies the configured global API request limit and forwards limit failures as an application error.                     |
| `apps/api/src/middlewares/not-found.middleware.ts`      | Converts unmatched HTTP routes into a `NotFoundException`.                                                               |
| `apps/api/src/middlewares/error-handler.middleware.ts`  | Normalizes AppError, Zod, and unknown errors, logs them at the correct level, and creates the final error response.      |
| `apps/api/src/middlewares/index.ts`                     | Public barrel for application middleware.                                                                                |

### API infrastructure

| File                                           | Responsibility                                                                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/api/src/infrastructure/logger/logger.ts` | Creates the configured Pino logger, enables pretty development logs, and redacts passwords, tokens, cookies, and authorization data. |
| `apps/api/src/infrastructure/logger/index.ts`  | Public barrel for the logger factory and configured logger instance.                                                                 |

### Demo module

| File                                           | Responsibility                                                                                  |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `apps/api/src/modules/demo/demo.routes.ts`     | Defines `GET /demo/connection` and binds it to the controller.                                  |
| `apps/api/src/modules/demo/demo.controller.ts` | Calls the demo service and returns the integration result through `ResponseHelper`.             |
| `apps/api/src/modules/demo/demo.service.ts`    | Reads the latest seeded demo record through Prisma and builds the full-stack connection result. |
| `apps/api/src/modules/demo/demo.types.ts`      | Defines the demo service result contract.                                                       |
| `apps/api/src/modules/demo/index.ts`           | Public API for the demo module.                                                                 |

### Health module

| File                                               | Responsibility                                                                               |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `apps/api/src/modules/health/health.routes.ts`     | Defines liveness and readiness endpoints and binds controller methods.                       |
| `apps/api/src/modules/health/health.controller.ts` | Maps health service results to HTTP messages and 200/503 status codes.                       |
| `apps/api/src/modules/health/health.service.ts`    | Computes liveness and readiness, checks PostgreSQL with a minimal query, and reports uptime. |
| `apps/api/src/modules/health/health.types.ts`      | Defines health state, dependency state, uptime, and timestamp fields.                        |
| `apps/api/src/modules/health/index.ts`             | Public API for the health module.                                                            |
| `apps/api/src/modules/index.ts`                    | Public barrel for all implemented application modules.                                       |

## 8. Current web file reference

### Next.js application files

| File                                | Responsibility                                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `apps/web/src/app/layout.tsx`       | Root App Router layout, metadata, HTML language, and global stylesheet registration.                                |
| `apps/web/src/app/page.tsx`         | Home route composition. It renders the boilerplate overview and live connection test.                               |
| `apps/web/src/app/loading.tsx`      | Route-level loading UI shown while the root segment is pending.                                                     |
| `apps/web/src/app/not-found.tsx`    | Friendly App Router 404 page.                                                                                       |
| `apps/web/src/app/global-error.tsx` | Client-side root error boundary with recovery action and required root HTML structure.                              |
| `apps/web/src/styles/globals.css`   | Tailwind import, design tokens, reset rules, layout/component styling, responsiveness, and reduced-motion behavior. |

### Web configuration, services, and features

| File                                                              | Responsibility                                                                                                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/web/src/config/public-environment.ts`                       | Validates the public API base URL. Only browser-safe `NEXT_PUBLIC_*` values belong here.                                             |
| `apps/web/src/services/api-client.ts`                             | Generic Fetch-based transport supporting JSON and non-JSON bodies, consistent API errors, request IDs, aborts, and network failures. |
| `apps/web/src/services/api.ts`                                    | Creates the application API client from validated public configuration.                                                              |
| `apps/web/src/features/platform/components/platform-overview.tsx` | Displays the technologies included in the template.                                                                                  |
| `apps/web/src/features/platform/components/connection-check.tsx`  | Client component that calls the demo endpoint and displays API/database state, seed data, errors, and request ID.                    |
| `apps/web/.env.example`                                           | Documents the browser-visible API base URL required by Next.js.                                                                      |
| `apps/web/next.config.ts`                                         | Enables typed routes and React Compiler and removes the powered-by header.                                                           |
| `apps/web/postcss.config.mjs`                                     | Registers the Tailwind CSS PostCSS plugin.                                                                                           |
| `apps/web/eslint.config.mjs`                                      | Activates the shared typed Next.js ESLint policy.                                                                                    |
| `apps/web/tsconfig.json`                                          | Strict Next.js TypeScript settings, source alias, and generated type includes.                                                       |
| `apps/web/package.json`                                           | Declares Next.js/React dependencies and web dev/build/start/lint/typecheck scripts.                                                  |
| `apps/web/AGENTS.md`                                              | Repository-local instructions for coding agents working in the web application.                                                      |
| `apps/web/CLAUDE.md`                                              | Compatibility pointer to the web agent instructions.                                                                                 |

### Web growth rules

- Page/layout/error/loading files belong in `src/app`.
- A product feature belongs in `src/features/<feature-name>`.
- Feature components, hooks, schemas, types, and constants stay inside their
  feature.
- Generic API/storage/telemetry adapters belong in `src/services`.
- Public environment parsing belongs in `src/config`.
- Truly reusable UI may be introduced under `src/shared` only after at least
  two real consumers exist.

## 9. Database package reference

| File                                                                                 | Responsibility                                                                                                             |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `packages/database/prisma/schema.prisma`                                             | Defines the PostgreSQL datasource, generated Prisma Client destination, and example `DemoMessage` model.                   |
| `packages/database/prisma/seed.ts`                                                   | Idempotently upserts the example record used by the frontend/API integration check.                                        |
| `packages/database/prisma/migrations/migration_lock.toml`                            | Records the Prisma migration provider so migration tooling uses PostgreSQL consistently.                                   |
| `packages/database/prisma/migrations/20260802184330_init_demo_message/migration.sql` | Creates the example table, primary key, and unique slug index.                                                             |
| `packages/database/prisma.config.ts`                                                 | Finds the workspace root, loads local environment, configures schema/migrations/seed, and supplies the CLI datasource URL. |
| `packages/database/src/client.ts`                                                    | Creates a Prisma 7 client with the PostgreSQL driver adapter from an injected connection string.                           |
| `packages/database/src/index.ts`                                                     | Public package API for the client factory, client type, Prisma namespace, and example model type.                          |
| `packages/database/tsconfig.json`                                                    | Strict development/type-check configuration for database source.                                                           |
| `packages/database/tsconfig.build.json`                                              | Emits ESM JavaScript, declarations, source maps, and declaration maps to `dist`.                                           |
| `packages/database/eslint.config.mjs`                                                | Typed Node ESLint policy with explicit support for Prisma config and seed files outside `src`.                             |
| `packages/database/package.json`                                                     | Database package exports, Prisma scripts, build/typecheck commands, and adapter dependencies.                              |

Generated Prisma files under `packages/database/src/generated/prisma` and build
files under `dist` are intentionally ignored. Never edit them by hand.

## 10. Shared package reference

### TypeScript configuration

| File                                      | Responsibility                                                                    |
| ----------------------------------------- | --------------------------------------------------------------------------------- |
| `packages/typescript-config/base.json`    | Environment-neutral strict compiler policy shared by every TypeScript workspace.  |
| `packages/typescript-config/node.json`    | Node.js ESM/NodeNext settings and Node type library.                              |
| `packages/typescript-config/nextjs.json`  | Browser, JSX, bundler resolution, and Next.js plugin settings.                    |
| `packages/typescript-config/package.json` | Publishes shared TypeScript configuration files as `@template/typescript-config`. |

### ESLint configuration

| File                                  | Responsibility                                                                                                 |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `packages/eslint-config/base.mjs`     | Factory for strict type-aware TypeScript, import ordering, unused import, and Prettier-compatible lint policy. |
| `packages/eslint-config/node.mjs`     | Adds Node.js globals to the base policy.                                                                       |
| `packages/eslint-config/next.mjs`     | Combines Next.js Core Web Vitals with the shared typed policy and browser globals.                             |
| `packages/eslint-config/package.json` | Publishes base, Node, and Next flat-config entry points and their peer dependencies.                           |
| `packages/eslint-config/README.md`    | Small usage reference for the shared ESLint package.                                                           |

### Prettier configuration

| File                                    | Responsibility                                                         |
| --------------------------------------- | ---------------------------------------------------------------------- |
| `packages/prettier-config/index.mjs`    | Shared formatting policy and Tailwind class/stylesheet integration.    |
| `packages/prettier-config/package.json` | Publishes the formatting configuration and pins its plugin dependency. |

## 11. Root file reference

| File                      | Responsibility                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `README.md`               | Quick-start guide, commands, architecture summary, environment notes, and link to this complete reference.          |
| `PROJECT_REFERENCE.md`    | Primary source of truth for structure, responsibilities, conventions, and every repository file.                    |
| `package.json`            | Root scripts, workspace tooling, supported Node/pnpm ranges, and package-manager pin.                               |
| `pnpm-lock.yaml`          | Reproducible resolved dependency graph generated by pnpm; never edit manually.                                      |
| `pnpm-workspace.yaml`     | Declares app/package workspace globs, dependency safety overrides, and approved native build scripts.               |
| `turbo.json`              | Defines build/dev/lint/typecheck/database task dependencies, cache behavior, and outputs.                           |
| `compose.yaml`            | Runs local PostgreSQL with configurable credentials/port, health check, persistence, and restart policy.            |
| `.env.example`            | Complete non-secret environment contract for API, database, and local Compose.                                      |
| `.gitignore`              | Excludes secrets, dependencies, generated code, build output, caches, logs, coverage, and editor artifacts.         |
| `.gitattributes`          | Normalizes text and line-ending behavior across operating systems.                                                  |
| `.editorconfig`           | Sets repository-wide indentation, encoding, trailing-whitespace, and newline policy.                                |
| `.npmrc`                  | Configures pnpm behavior used by this workspace.                                                                    |
| `.nvmrc`                  | Declares the expected Node.js major version for version managers.                                                   |
| `.prettierignore`         | Excludes generated, dependency, build, and agent-instruction files from formatting.                                 |
| `prettier.config.mjs`     | Loads the shared Prettier package and points Tailwind formatting at the real web stylesheet.                        |
| `.vscode/settings.json`   | Enables workspace TypeScript, Prettier-on-save, ESLint fixes, automatic ESLint working directories, and LF endings. |
| `.vscode/extensions.json` | Recommends ESLint, Prettier, Tailwind CSS, Prisma, and Docker editor extensions.                                    |

## 12. Environment variables

| Variable                   | Owner      | Purpose                                            |
| -------------------------- | ---------- | -------------------------------------------------- |
| `NODE_ENV`                 | API        | Selects development, test, or production behavior. |
| `APP_NAME`                 | API        | Optional application display name.                 |
| `API_HOST`                 | API        | HTTP bind address.                                 |
| `API_PORT`                 | API        | HTTP listening port.                               |
| `API_PREFIX`               | API        | Versioned route prefix, default `/api/v1`.         |
| `CORS_ORIGINS`             | API        | Comma-separated browser origins.                   |
| `DATABASE_URL`             | API/Prisma | PostgreSQL connection URL.                         |
| `LOG_LEVEL`                | API        | Pino logging level.                                |
| `TRUST_PROXY`              | API        | `false` or a trusted proxy hop count from 1 to 10. |
| `BODY_LIMIT`               | API        | Express JSON and URL-encoded body limit.           |
| `API_RATE_LIMIT_WINDOW_MS` | API        | Global rate-limit time window.                     |
| `API_RATE_LIMIT_MAX`       | API        | Requests allowed per window.                       |
| `REQUEST_TIMEOUT_MS`       | API        | Node request timeout.                              |
| `HEADERS_TIMEOUT_MS`       | API        | Node headers timeout.                              |
| `KEEP_ALIVE_TIMEOUT_MS`    | API        | Node keep-alive timeout.                           |
| `SHUTDOWN_TIMEOUT_MS`      | API        | Maximum graceful-shutdown duration.                |
| `POSTGRES_USER`            | Compose    | Local PostgreSQL user.                             |
| `POSTGRES_PASSWORD`        | Compose    | Local PostgreSQL password.                         |
| `POSTGRES_DB`              | Compose    | Local PostgreSQL database.                         |
| `POSTGRES_PORT`            | Compose    | Host port mapped to PostgreSQL.                    |
| `NEXT_PUBLIC_API_URL`      | Web        | Browser-visible base URL for API requests.         |

## 13. Commands and change checklist

Run from the repository root:

```powershell
pnpm install --frozen-lockfile
docker compose up -d postgres
pnpm db:migrate:deploy
pnpm db:generate
pnpm db:seed
pnpm dev
```

Before committing:

```powershell
pnpm format:check
pnpm lint
pnpm check-types
pnpm build
git diff --check
```

For a new module:

1. Create only required module files.
2. Validate every external input.
3. Keep HTTP behavior in the controller.
4. Keep application logic in the service.
5. Inject Prisma/infrastructure dependencies.
6. Return responses with `ResponseHelper`.
7. Mount the module in `router.ts`.
8. Add tests when test infrastructure is introduced.
9. Update this reference in the same change.
