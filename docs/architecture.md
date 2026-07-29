# Architecture Decisions

This document explains the _why_ behind the major structural choices in this boilerplate. Treat it as a living record, not a spec — update it when a decision changes.

## Hexagonal architecture (ports & adapters)

**Why:** decouples business logic from frameworks and infrastructure (HTTP, ORM, external APIs), so any of those can be swapped or tested in isolation. A domain aggregate should be understandable — and testable — without NestJS, TypeORM, or a database running.

**Dependency rule:** `infrastructure → application → domain`, never the reverse. Ports (interfaces) are defined in `domain/`; adapters (implementations) live in `infrastructure/` and are bound to their port via a `Symbol` DI token in each module's `*.module.ts`.

## CQRS, and why it doesn't imply anemic models

CQRS (`@nestjs/cqrs`) separates the write path (Commands) from the read path (Queries). It says nothing about whether the domain model itself should be "smart" or "dumb" — that's an independent, separate decision (Domain-Driven Design), which this project makes explicitly: **domain models are rich**, not anemic.

Concretely: `User.deactivate()` enforces its own invariants inside the aggregate, rather than a command handler mutating a plain `isActive` field directly. Handlers stay thin — fetch/create the aggregate, call a method on it, persist it — because the actual business rule lives in one place (the aggregate), not scattered across every handler that happens to touch that field.

The trade-off is more ceremony (private fields, factory methods instead of `new`, getters) in exchange for enforced invariants. For a boilerplate meant to demonstrate the pattern clearly, that trade-off favors correctness and discoverability over minimal line count.

## CommonJS over ESM

ESM was tried first and reverted. In practice, with this exact stack (NestJS + TypeORM CLI + a test runner), ESM introduced friction disproportionate to its benefit: explicit `.js` extensions in relative imports, a webpack/bundler default-export unwrapping bug specific to `nest-cli`'s config loader, and CJS/ESM bundle-format mismatches with `"type": "module"`. CommonJS + the SWC builder + `tsc-alias` for path-alias rewriting is the pragmatic, low-friction choice today. `moduleResolution: nodenext` is still used (with `module: commonjs`) purely for its stricter, more accurate type-checking — this has no effect on the actual runtime module format.

## No bundler for the app build

A bundler (webpack/Rspack) was considered specifically to avoid writing `.js` extensions in ESM imports. Once the ESM decision was reverted, the bundler's main justification went with it — plain Node module resolution handles CommonJS imports without any extension requirements. `tsc-alias` alone is sufficient to resolve the one remaining gap (path aliases), with far less configuration surface than a full bundler.

## Domain exceptions + a global exception filter, not `Result<T, E>`

A functional-style `Result<T, E>` return type was considered for domain/application error handling, then dropped in favor of throwing typed exceptions caught by a global filter. NestJS's own idioms (`ValidationPipe`, `HttpException`, exception filters) are all throw/catch-based — mixing in a parallel `Result`-based error-handling system for only _some_ errors would mean two error-handling mechanisms coexisting in the same codebase, with no clear rule for which one applies where. Consistency with the framework's own paradigm won out over the type-safety benefits `Result` provides in purely functional codebases.

## Single UUIDv7 identifier per aggregate

A dual-ID pattern (internal auto-increment `bigint` PK for fast joins + a separate opaque public ID for external exposure) was considered for its indexing/join performance benefits, and its ability to hide sequential IDs from enumeration. It was dropped in favor of a single UUIDv7 per aggregate: UUIDv7 is time-ordered, giving most of the index-locality benefit of a sequential integer, while remaining a single, unguessable identifier the domain can generate itself at creation time (rather than waiting for the database to assign an ID on insert, which would leave a newly-created aggregate without an identity — awkward for immediately emitting domain events with a real ID).

## RBAC as a separate module from `users`, kept unidirectional

Roles and permissions were initially modeled inside the `users` module, then extracted into a standalone `permissions` module. The dependency between them is intentionally **unidirectional**: `users` depends on `permissions` (a `User` has roles; `RegisterUserHandler` assigns a default role via a port), but `permissions` never imports anything from `users`.

This required care around TypeORM's `@ManyToMany` relations, which are bidirectional by default (`User.roles` and `Role.users`) — the inverse side (`Role.users`) was dropped, since nothing in the codebase actually needs to navigate `role → users`, and keeping it would have created a circular import between the two modules' ORM entities. Where `permissions` needs to query user-role assignments (e.g. `TypeOrmPermissionChecker`, `TypeOrmRoleAssigner`), it queries the join table directly via `createQueryBuilder` instead of importing `UserOrmEntity`.

Ports that cross this module boundary (e.g. `RoleAssignerPort.assignDefaultRole(userId: string)`) intentionally accept primitives (`string`), not Value Objects from the other module's domain — passing a `UserId` VO across the boundary would reintroduce the same circular dependency at the type level.

## Guards and decorators live in their owning module, not `shared/`

`JwtAuthGuard`, `PermissionsGuard`, `@RequirePermissions()`, `@Public()`, `@CurrentUser()` all know about a specific mechanism (JWT verification, RBAC) — that makes them the property of `auth/` and `permissions/` respectively, not `shared/`. The rule: **`shared/` must never depend on a specific module.** If a piece of code imports anything from `@modules/*`, it doesn't belong in `shared/`, no matter how "infrastructural" it looks.

## Response envelope: `{ data }` / `{ data, meta }`, errors as `{ error }`

There is no ratified RFC for success response shapes (unlike errors, where RFC 9457 is a real IETF standard). The closest formal alternatives — JSON:API, HAL — are either heavier than needed for this project or still an unratified Internet Draft. This boilerplate uses a minimal, symmetric envelope: `{ data }` for a single resource, `{ data, meta: { pagination } }` for paginated lists, and `{ error }` for failures — so a client only ever branches on one top-level key, never on response shape. This deliberately departs from strict RFC 9457 compliance (which expects a flat top-level object, not one nested under `error`) in favor of that symmetry.
