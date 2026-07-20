import { faker } from "@faker-js/faker";
import * as bcrypt from "bcrypt";

import { UserId } from "@modules/users/domain/value-objects/user-id.vo";
import { UserOrmEntity } from "@modules/users/infrastructure/persistence/typeorm/user.orm-entity";
import { Factory } from "@shared/infrastructure/database/seeds/factory.base";

export class UserFactory extends Factory<UserOrmEntity> {
  protected definition(): Partial<UserOrmEntity> {
    return {
      id: UserId.create().toString(),
      email: faker.internet.email().toLowerCase(),
      passwordHash: bcrypt.hashSync("password123", 12),
      isActive: true,
    };
  }
}
