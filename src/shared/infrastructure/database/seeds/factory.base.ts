import { DataSource, EntityTarget, ObjectLiteral } from "typeorm";

export abstract class Factory<T extends ObjectLiteral> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly entity: EntityTarget<T>,
  ) {}

  protected abstract definition(): Partial<T>;

  make(overrides: Partial<T> = {}): T {
    const repo = this.dataSource.getRepository(this.entity);
    return repo.create({ ...this.definition(), ...overrides } as T);
  }

  async create(overrides: Partial<T> = {}): Promise<T> {
    const repo = this.dataSource.getRepository(this.entity);
    return repo.save(this.make(overrides));
  }

  async createMany(count: number, overrides: Partial<T> = {}): Promise<T[]> {
    return Promise.all(Array.from({ length: count }, () => this.create(overrides)));
  }
}
