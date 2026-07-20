import { version as uuidVersion } from "uuid";
import { describe, expect, it } from "vitest";

import { EntityId } from "./entity-id.vo";

describe("EntityId", () => {
  it("creates UUID v7 identifiers", () => {
    const id = EntityId.for<"some-entity">().create();
    expect(uuidVersion(id.toString())).toBe(7);
  });

  it("creates branded ID factories for individual entities", () => {
    const UserId = EntityId.for<"user">();
    const id = UserId.create();

    expect(id).toBeInstanceOf(EntityId);
    expect(uuidVersion(id.toString())).toBe(7);
  });

  it("rejects identifiers other than UUID v7 when reconstituting", () => {
    expect(() =>
      EntityId.for<"some-entity">().reconstitute("b1749282-e594-4e24-8d8e-8f3bce5ad5d4"),
    ).toThrow("Entity ID must be a valid UUID v7");
  });
});
