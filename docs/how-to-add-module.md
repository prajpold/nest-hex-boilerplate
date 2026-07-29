# How to Add a New Module

Checklist for adding a new bounded context to this boilerplate. Use `src/modules/users/` as your reference — it's the fullest example of every layer described below.

## 0. Naming

- Module folder, `*Module`, `*Controller`, `*Seeder` → **plural** (`orders`, `OrdersModule`, `OrdersController`, `OrdersSeeder`)
- Aggregate, repository port, `*Factory` → **singular** (`Order`, `OrderRepository`, `OrderFactory`)

## 1. Domain (`domain/`)

- [ ] `models/<name>.aggregate.ts` — extend `AggregateRoot` (`@nestjs/cqrs`). Private constructor, static `create()`/`register()` factory (generates its own UUIDv7 id, emits a domain event), static `reconstitute()` factory (used by the mapper, no event emission).
- [ ] `value-objects/*.vo.ts` — extend `ValueObject<T>` (`@shared/domain/value-object.base`). Private constructor + static `create()` that validates and throws on failure.
- [ ] `errors/<name>.errors.ts` — extend `DomainError` (`@shared/domain/domain-error.base`) for anything that represents a broken business rule (not a plain "not found", which should use NestJS's own `NotFoundException` at the query-handler level).
- [ ] `events/*.event.ts` — plain classes, no framework dependency.
- [ ] `ports/<name>.repository.ts` — interface only. Methods should accept/return primitives or domain types from _this_ module — never a Value Object from another module (that would create a circular dependency between modules).

## 2. Application (`application/`)

- [ ] `commands/<use-case>/` — `*.command.ts` (plain data) + `*.handler.ts` (`@CommandHandler`, injects ports via their `Symbol` token, orchestrates: validate/fetch → call a method on the aggregate → persist → `.commit()` for events). Keep handlers thin — logic belongs in the aggregate.
- [ ] `queries/<use-case>/` — `*.query.ts` + `*.handler.ts` (`@QueryHandler`). Returns a DTO (`application/dto/`), never the raw aggregate.
- [ ] `ports/` — any _outbound_ ports needed only by this module's use cases (e.g. a hasher, a notifier) that don't belong in `domain/` because they're pure infrastructure concerns, not part of the domain's contract.
- [ ] For paginated queries, return `PaginatedApiResponse<T>` via `buildPaginatedResult()` from `@shared/kernel/pagination`.

## 3. Infrastructure (`infrastructure/`)

- [ ] `persistence/typeorm/<name>.orm-entity.ts` — extends `BaseOrmEntity` (`@shared/infrastructure/database/base-orm.entity`), which gives you `id` (UUID), `createdAt`, `updatedAt`.
- [ ] `persistence/typeorm/<name>.mapper.ts` — static `toDomain()` / `toOrm()`.
- [ ] `persistence/typeorm/<name>.typeorm-repository.ts` — implements the domain port.
- [ ] `persistence/seeds/<name>.factory.ts` — extends `Factory<T>` (`@shared/infrastructure/database/seeds/factory.base`), uses `@faker-js/faker` in `definition()`.
- [ ] `persistence/seeds/NN-<name>.seeder.ts` — implements `Seeder`. The `NN-` prefix controls execution order relative to other seeders; auto-discovered, no manual registration needed.
- [ ] `http/<name>.controller.ts` — injects `CommandBus`/`QueryBus`. Add `@Public()` for unauthenticated routes, `@RequirePermissions('resource:action')` for protected ones.
- [ ] `http/dto/*.request.dto.ts` — `class-validator` decorators + `@ApiProperty()` for Swagger.

## 4. Wiring (`<name>.module.ts` + `<name>.tokens.ts`)

- [ ] `<name>.tokens.ts` — a `Symbol('...')` per port.
- [ ] `<name>.module.ts` — `imports: [CqrsModule, TypeOrmModule.forFeature([...])]`, `providers` binding each `Symbol` token to its adapter (`useClass`), plus all command/query handlers.
- [ ] If this module needs another module's port (e.g. `permissions`'s `PermissionCheckerPort`), import that module and inject its exported token — don't import the other module's ORM entities directly. Keep the dependency unidirectional.
- [ ] Register the new module in `src/app.module.ts`.
- [ ] Add its entities to the explicit list in `src/shared/infrastructure/database/data-source.ts` and `typeorm.config.ts`.

## 5. Migration & seed

```bash
npm run migration:generate -- src/shared/infrastructure/database/migrations/CreateOrders
npm run migration:run
npm run seed:run
```

## 6. Tests

- [ ] `domain/models/<name>.aggregate.spec.ts` — plain unit tests, no `TestingModule`, no mocks needed beyond what the aggregate itself requires.
- [ ] `application/commands/.../*.handler.spec.ts` — mock ports as plain objects (`vi.fn()`), instantiate the handler directly with `new`. No Nest DI container needed.
- [ ] e2e tests in `test/`, run against the real (Compose) Postgres.

## 7. Sanity check

```bash
npm run lint
npm run typecheck
npm run build
npm run test
npm run test:e2e
```
