import { DataSource } from "typeorm";

import { PermissionOrmEntity } from "@modules/permissions/infrastructure/persistence/typeorm/permission.orm-entity";
import { RoleOrmEntity } from "@modules/permissions/infrastructure/persistence/typeorm/role.orm-entity";
import { Seeder } from "@shared/infrastructure/database/seeds/seeder.interface";

const PERMISSIONS = ["users:read", "users:create", "users:update", "users:delete"];

export class RolesPermissionsSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const permissionRepo = dataSource.getRepository(PermissionOrmEntity);
    const roleRepo = dataSource.getRepository(RoleOrmEntity);

    const permissions = await permissionRepo.save(PERMISSIONS.map((name) => ({ name })));

    await roleRepo.save({ name: "admin", permissions });
    await roleRepo.save({
      name: "viewer",
      permissions: permissions.filter((p) => p.name === "users:read"),
    });

    console.log(`    seeded ${permissions.length} permissions, 2 roles`);
  }
}
