# nest-hex-boilerplate

A batteries-included NestJS template — hexagonal architecture, CQRS, TypeORM, JWT auth, RBAC, Docker, CI/CD.

Meant to be used as a GitHub template repository — a starting point for new backend projects, not a finished product in itself.

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [Working with the Database](#working-with-the-database)
- [Adding a New Module](#adding-a-new-module)
- [Docker](#docker)
- [CI/CD](#cicd)
- [Further Reading](#further-reading)

## Architecture

This project follows **hexagonal architecture** (ports & adapters) combined with **CQRS**. Each feature module is a self-contained bounded context split into three layers:

- **`domain/`** — pure business logic. Aggregates, value objects, domain events, domain exceptions, and repository/gateway _interfaces_ (ports). Zero dependencies on NestJS, TypeORM, or any framework, aside from `AggregateRoot` from `@nestjs/cqrs`.
- **`application/`** — use cases, expressed as CQRS commands, queries, and their handlers. Orchestrates the domain through the ports it depends on. It uses Nest's CQRS decorators and dependency injection, but does not depend on HTTP or persistence adapters.
- **`infrastructure/`** — adapters. HTTP controllers, TypeORM repositories (implementing the ports from `domain/`), security adapters (JWT, bcrypt), and guards. This layer contains transport and persistence concerns.

**Dependency rule:** `infrastructure → application → domain`, never the other way around.

Domain models are **rich, not anemic** — business rules live inside aggregates (e.g. `User.deactivate()` enforces its own invariants), not scattered across command handlers. Handlers stay thin: fetch/create the aggregate, call a method on it, persist it.

Error handling follows a conventional OOP/NestJS style: domain logic throws typed exceptions (subclasses of `DomainError`), and a global exception filter maps them — along with NestJS's own exceptions — to a consistent JSON error shape. See [API Overview](#api-overview).

Within `domain/`, each module is organized by type:

```
domain/
  models/          # aggregates / domain entities
  value-objects/
  events/
  errors/
  ports/           # repository and gateway interfaces
```

See `src/modules/users/` for the fullest reference implementation of this pattern.

## Tech Stack

| Concern                 | Choice                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| Framework               | NestJS (CommonJS, SWC builder)                                                                 |
| Language                | TypeScript (strict mode, `moduleResolution: nodenext`)                                         |
| CQRS                    | `@nestjs/cqrs`                                                                                 |
| Database                | PostgreSQL                                                                                     |
| ORM                     | TypeORM (Data Mapper pattern — no Active Record)                                               |
| Auth                    | JWT access + refresh tokens (`@nestjs/jwt`, `@nestjs/passport`), refresh tokens hashed at rest |
| Authorization           | Custom RBAC (`permissions` module): roles <-> permissions, `resource:action` convention        |
| Env config & validation | `@nestjs/config` + Zod                                                                         |
| Path aliases            | TypeScript aliases: `@modules/*`, `@shared/*`, `~/*`                                           |
| API docs                | Swagger (`@nestjs/swagger`), disabled in production                                            |
| Linting                 | oxlint + `oxlint-tsgolint` (type-aware rules)                                                  |
| Formatting              | Prettier + `@trivago/prettier-plugin-sort-imports`                                             |
| Testing                 | Vitest (unit + e2e, separate configs)                                                          |
| Fake data               | `@faker-js/faker`                                                                              |
| Containers              | Docker (multi-stage) + Docker Compose (app, Postgres, Adminer)                                 |
| CI                      | GitHub Actions (lint, migrations, tests, build, Docker build, migration diff check)            |
| Git hooks               | Husky + lint-staged + commitlint (Conventional Commits)                                        |

## Project Structure

```
src/
├── main.ts
├── app.module.ts
│
├── shared/                          # cross-cutting code, must never depend on a specific module
│   ├── domain/                      # entity, value-object, event and error base classes
│   ├── kernel/                      # API-response types and pagination helpers
│   ├── config/                      # namespaced env configs (app, database, auth) + Zod schema
│   └── infrastructure/
│       ├── database/
│       │   ├── data-source.ts       # DataSource for TypeORM CLI (migrations)
│       │   ├── typeorm.config.ts    # DataSource factory for the running app
│       │   ├── base.orm-entity.ts   # shared id/createdAt/updatedAt columns
│       │   ├── migrations/
│       │   └── seeds/               # Seeder interface, Factory base class, glob-based runner
│       └── health/                  # /health endpoint (@nestjs/terminus)
│
└── modules/
    ├── users/          # user aggregate, registration, profile queries — the reference module
    ├── auth/            # login, JWT issuance/verification, JwtAuthGuard, @Public/@CurrentUser
    └── permissions/     # RBAC: roles, permissions, PermissionsGuard, @RequirePermissions
```

Guards and decorators live inside the module that owns their concern (`auth/`, `permissions/`) — never in `shared/`, since `shared/` must never depend on a specific module.

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### Setup

```bash
git clone git@github.com:<you>/nest-hex-boilerplate.git
cd nest-hex-boilerplate
npm install

cp .env.example .env
# adjust values in .env if needed — JWT_SECRET must be at least 32 characters

docker-compose up -d postgres adminer   # start just the DB for local dev
npm run migration:run
npm run seed:run

npm run start:dev
```

The API is available at `http://localhost:3000`. Swagger docs (non-production only) at `http://localhost:3000/api/docs`. Adminer at `http://localhost:8080` — use `postgres` (the Compose service name, not `localhost`) as the server host.

To run the full stack (including the app) in Docker instead: `docker-compose up --build`.

## Available Scripts

| Script                                 | Description                                                     |
| -------------------------------------- | --------------------------------------------------------------- |
| `npm run start:dev`                    | Start the app in watch mode                                     |
| `npm run build`                        | Compile with SWC (including a TypeScript type check)             |
| `npm run start`                        | Start the app through the Nest CLI                               |
| `npm run start:prod`                   | Run the compiled build (`node dist/main`)                        |
| `npm run lint`                         | Run oxlint (type-aware rules included)                          |
| `npm run test`                         | Run unit tests (Vitest)                                         |
| `npm run test:e2e`                     | Run e2e tests (Vitest, separate config, real DB)                |
| `npm run migration:generate -- <path>` | Generate a migration from entity changes                        |
| `npm run migration:run`                | Apply pending migrations                                        |
| `npm run migration:revert`             | Roll back the last migration                                    |
| `npm run migration:show`               | List applied/pending migrations                                 |
| `npm run seed:run`                     | Discover and run all `*.seeder.ts` files under `src/modules/**` |

## API Overview

**Auth**

- `POST /auth/login` — public. Returns `{ accessToken, refreshToken }`.

**Users**

- `POST /users` — public. Registers a user; automatically assigned the default `viewer` role.
- `GET /users/:id` — requires `users:read` permission.
- `GET /users?page=&limit=` — requires `users:read` permission. Paginated.

**Health**

- `GET /health` — public. Checks database connectivity.
- `GET /` — requires a valid JWT; returns `Hello World!`.

**Response shapes**

`POST /auth/login` and `POST /users` return a `{ "data": ... }` envelope. `GET /users` returns `{ "data": [...], "meta": { "page", "limit", "totalItems", "totalPages" } }`. `GET /users/:id` returns the user DTO directly, and `GET /health` returns Nest Terminus's health-check payload.

Errors are returned as `application/problem+json` in a flat Problem Details-like shape:

```json
{
  "type": "about:blank",
  "title": "UserAlreadyExistsError",
  "status": 400,
  "detail": "...",
  "instance": "/users"
}
```

## Working with the Database

- **Never** use `synchronize: true`. All schema changes go through migrations.
- TypeORM discovers entities and migrations through glob patterns configured in `data-source.ts` and `typeorm.config.ts`.
- Generate a migration after changing an entity:
  ```bash
  npm run migration:generate -- src/shared/infrastructure/database/migrations/DescriptiveName
  npm run migration:run
  ```
- Seeders are auto-discovered by filename pattern (`*.seeder.ts`) anywhere under `src/modules/**` and run in lexicographic path order. The current seeders are `01-roles-permissions.seeder.ts` and `01-users.seeder.ts`.
- Use the `Factory<T>` base class (`shared/infrastructure/database/seeds/factory.base.ts`) with `@faker-js/faker` for realistic fake data.

## Adding a New Module

1. Copy `src/modules/users/` as a starting point — it's the fullest example of the pattern (domain aggregate, VOs, commands, queries, TypeORM adapter, controller, factory/seeder).
2. Work outward from the domain: aggregate → ports → commands/queries → infrastructure adapters.
3. Naming convention: module/controller/seeder in **plural** (`OrdersModule`, `OrdersController`, `OrdersSeeder`); aggregate/repository port/factory in **singular** (`Order`, `OrderRepository`, `OrderFactory`).
4. Register the module's providers (repository implementations bound to their port tokens via `Symbol`) in its `*.module.ts`.
5. If your module needs to depend on another module (e.g. reading roles/permissions), keep the dependency **unidirectional** — query through the owning module's exported port/repository rather than importing its ORM entities directly, to avoid circular module dependencies. See `permissions`'s `TypeOrmPermissionChecker` for an example of querying a join table directly instead of importing a foreign entity.
6. Add a `NN-<name>.seeder.ts` file if it needs seed data — it's picked up automatically.

**Extending auth:** to add another auth strategy (OAuth, API keys, magic links) alongside JWT, implement a new adapter for `TokenGeneratorPort` (or a new Passport strategy) and register it in `AuthModule` — handlers and guards don't need to change.

## Docker

- `Dockerfile` — multi-stage production build (deps → build → prod-deps → runtime), non-root user, healthcheck against `/health`.
- `docker-compose.yml` — `app`, `postgres`, `adminer`. The app connects to `postgres` (the service name) when running in Compose, not `localhost`.
- Migrations are **not** run automatically on container start — run them explicitly (`npm run migration:run` from the host, targeting the exposed Postgres port) before or after bringing the stack up.

## CI/CD

GitHub Actions (`.github/workflows/`):

- `ci.yml` — lint, migrations, unit + e2e tests (against a real Postgres service container), build, and a Docker build verification.
- `migrations-check.yml` — fails the build if entity changes exist without a corresponding migration.

## Further Reading

- `docs/architecture.md` — the reasoning behind the major architectural decisions in this repo.
- `docs/how-to-add-module.md` — step-by-step checklist for adding a new bounded context.
