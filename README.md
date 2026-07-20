# nest-hex-boilerplate

A batteries-included NestJS template — hexagonal architecture, CQRS, TypeORM, auth, Docker, CI/CD.

Meant to be used as a GitHub template repository — a starting point for new backend projects, not a finished product in itself.

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Working with the Database](#working-with-the-database)
- [Adding a New Module](#adding-a-new-module)
- [Project Status / Roadmap](#project-status--roadmap)

## Architecture

This project follows **hexagonal architecture** (ports & adapters) combined with **CQRS**. Each feature module is a self-contained bounded context split into three layers:

- **`domain/`** — pure business logic. Aggregates, value objects, domain events, domain exceptions, and repository _interfaces_ (ports). Zero dependencies on NestJS, TypeORM, or any framework.
- **`application/`** — use cases, expressed as CQRS commands, queries, and their handlers. Orchestrates the domain through the ports it depends on. Depends only on `domain/`.
- **`infrastructure/`** — adapters. HTTP controllers, TypeORM repositories (implementing the ports from `domain/`), external API clients, etc. This is the only layer allowed to depend on frameworks and external libraries.

**Dependency rule:** `infrastructure → application → domain`, never the other way around.

Error handling follows a conventional OOP/NestJS style: domain logic throws typed exceptions (subclasses of a base `DomainError`), and a global exception filter maps them to HTTP responses. No functional-style `Result<T, E>` wrapper — this keeps the codebase idiomatic to NestJS instead of mixing paradigms.

## Tech Stack

| Concern                 | Choice                                                  |
| ----------------------- | ------------------------------------------------------- |
| Framework               | NestJS (CommonJS, SWC builder)                          |
| Language                | TypeScript (strict mode)                                |
| CQRS                    | `@nestjs/cqrs`                                          |
| Database                | PostgreSQL                                              |
| ORM                     | TypeORM (Data Mapper pattern — no Active Record)        |
| Env config & validation | `@nestjs/config` + Zod                                  |
| Path aliases            | `tsc-alias` (rewritten post-build; no bundler)          |
| Linting                 | oxlint + `oxlint-tsgolint` (type-aware rules)           |
| Formatting              | Prettier + `@trivago/prettier-plugin-sort-imports`      |
| Testing                 | Vitest (unit + e2e, separate configs)                   |
| Fake data               | `@faker-js/faker`                                       |
| Containers              | Docker + Docker Compose (Postgres, Adminer)             |
| Git hooks               | Husky + lint-staged + commitlint (Conventional Commits) |

## Project Structure

```
src/
├── main.ts
├── app.module.ts
│
├── shared/                          # cross-cutting code, shared across modules
│   ├── domain/
│   │   └── domain-event.base.ts
│   ├── kernel/                      # small framework-agnostic helpers
│   ├── config/                      # namespaced env configs (app, database, auth) + Zod schema
│   └── infrastructure/
│       └── database/
│           ├── data-source.ts       # DataSource for TypeORM CLI (migrations)
│           ├── typeorm.config.ts    # DataSource factory for the running app
│           ├── base-orm.entity.ts   # shared id/createdAt/updatedAt columns
│           ├── migrations/
│           └── seeds/               # Seeder interface, Factory base class, glob-based runner
│
└── modules/
    └── <feature>/                   # one bounded context per module, e.g. "users", "orders"
        ├── domain/
        ├── application/
        │   ├── commands/
        │   ├── queries/
        │   ├── events/
        │   └── ports/
        └── infrastructure/
            ├── http/
            └── persistence/typeorm/
```

New modules should mirror the `example/` module (see [Adding a New Module](#adding-a-new-module)).

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
# adjust values in .env if needed

docker-compose up -d      # starts Postgres + Adminer
npm run migration:run
npm run seed:run

npm run start:dev
```

The API will be available at `http://localhost:3000` (or whatever `PORT`/`API_PREFIX` you set in `.env`). Adminer (DB inspection UI) is at `http://localhost:8080` — use `postgres` (the Docker Compose service name, not `localhost`) as the server host when connecting from Adminer.

## Available Scripts

| Script                                 | Description                                                     |
| -------------------------------------- | --------------------------------------------------------------- |
| `npm run start:dev`                    | Start the app in watch mode                                     |
| `npm run build`                        | Compile with SWC, then rewrite path aliases with `tsc-alias`    |
| `npm run start` / `npm run start:prod` | Run the compiled build                                          |
| `npm run lint`                         | Run oxlint (type-aware rules included)                          |
| `npm run test`                         | Run unit tests (Vitest)                                         |
| `npm run test:e2e`                     | Run e2e tests (Vitest, separate config, real DB)                |
| `npm run migration:generate`           | Generate a migration from entity changes                        |
| `npm run migration:run`                | Apply pending migrations                                        |
| `npm run migration:revert`             | Roll back the last migration                                    |
| `npm run migration:show`               | List applied/pending migrations                                 |
| `npm run seed:run`                     | Discover and run all `*.seeder.ts` files under `src/modules/**` |

## Test Conventions

- Keep unit tests next to the code they cover, using the `*.spec.ts` suffix (for example, `src/shared/domain/entity-id.vo.spec.ts`). They run with `npm run test`.
- Keep integration and end-to-end tests in `test/`, using the `*.e2e-spec.ts` suffix. They run with `npm run test:e2e`.

## Working with the Database

- **Never** use `synchronize: true`. All schema changes go through migrations.
- Generate a migration after changing an entity:
  ```bash
  npm run migration:generate -- src/shared/infrastructure/database/migrations/DescriptiveName
  npm run migration:run
  ```
- Seeders are auto-discovered by filename pattern (`*.seeder.ts`) anywhere under `src/modules/**` — no manual registration needed. Use a numeric prefix (`01-user.seeder.ts`, `02-order.seeder.ts`) to control execution order when one seeder depends on another.
- Use the `Factory<T>` base class (`shared/infrastructure/database/seeds/factory.base.ts`) with `@faker-js/faker` to generate realistic fake data for seeders and tests.

## Adding a New Module

1. Copy the `example/` module as a starting point.
2. Rename it, and work outward from the domain: aggregate → ports → commands/queries → infrastructure adapters.
3. Register the module's providers (repository implementations bound to their port tokens) in its `*.module.ts`.
4. If it needs seed data, add a `NN-<name>.seeder.ts` file — it'll be picked up automatically.

## Project Status / Roadmap

This boilerplate is being built incrementally. Current status:

- [x] Project init, tooling (linting, formatting, git hooks)
- [x] Directory structure & path aliases
- [x] Environment config with Zod validation
- [x] Docker Compose (Postgres, Adminer)
- [x] TypeORM setup, migrations, seeds
- [ ] Generic User module (domain + application + infrastructure)
- [ ] Auth (JWT) + RBAC / permissions
- [ ] `example` module as an architecture reference
- [ ] Swagger documentation
- [ ] Global exception filter (domain errors → HTTP responses)
- [ ] Full app containerization + CI/CD (GitHub Actions)
- [ ] Expanded docs (ADR, "how to add a module" guide)
