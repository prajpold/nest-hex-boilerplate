import { EntityId } from "@shared/domain/entity-id.vo";

export type UserId = EntityId<"user">;

export const UserId = EntityId.for<"user">();
