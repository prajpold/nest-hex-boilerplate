import { ValueObject } from "@shared/domain/value-object.base";

/**
 * Convention: "resource:action", eg. "orders:create", "users:delete"
 */
export class Permission extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(resource: string, action: string): Permission {
    return new Permission(`${resource}:${action}`);
  }

  static fromString(raw: string): Permission {
    return new Permission(raw);
  }
}
