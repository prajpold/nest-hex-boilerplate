import { DataSource } from "typeorm";

import { UserFactory } from "@modules/users/infrastructure/persistence/seeds/user.factory";
import { UserOrmEntity } from "@modules/users/infrastructure/persistence/typeorm/user.orm-entity";
import { Seeder } from "@shared/infrastructure/database/seeds/seeder.interface";

export class UsersSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const factory = new UserFactory(dataSource, UserOrmEntity);
    await factory.createMany(10);
    console.log("    10 users seeded");
  }
}
