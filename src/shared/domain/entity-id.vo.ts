import { version as uuidVersion, v7 as uuidv7, validate as validateUuid } from "uuid";

import { ValueObject } from "@shared/domain/value-object.base";

type EntityIdFactory<Brand extends string> = {
  create(): EntityId<Brand>;
  reconstitute(value: string): EntityId<Brand>;
};

export class EntityId<Brand extends string = string> extends ValueObject<string> {
  declare private readonly brand: Brand;

  private constructor(value: string) {
    super(value);

    if (!validateUuid(value) || uuidVersion(value) !== 7) {
      throw new Error(`Entity ID must be a valid UUID v7: "${value}"`);
    }
  }

  private static create<Brand extends string = string>(): EntityId<Brand> {
    return new EntityId<Brand>(uuidv7());
  }

  private static reconstitute<Brand extends string = string>(value: string): EntityId<Brand> {
    return new EntityId<Brand>(value);
  }

  static for<Brand extends string>(): EntityIdFactory<Brand> {
    return {
      create: () => EntityId.create<Brand>(),
      reconstitute: (value) => EntityId.reconstitute<Brand>(value),
    };
  }
}
