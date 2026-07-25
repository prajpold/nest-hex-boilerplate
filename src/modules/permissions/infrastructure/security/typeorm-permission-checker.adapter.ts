import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { PermissionCheckerPort } from "@modules/permissions/domain/ports/permission-checker.port";
import { RoleOrmEntity } from "@modules/permissions/infrastructure/persistence/typeorm/role.orm-entity";

@Injectable()
export class TypeOrmPermissionChecker implements PermissionCheckerPort {
  constructor(
    @InjectRepository(RoleOrmEntity) private readonly roleRepo: Repository<RoleOrmEntity>,
  ) {}

  async getUserPermissions(userId: string): Promise<string[]> {
    const roles = await this.roleRepo
      .createQueryBuilder("role")
      .innerJoin("role.permissions", "permission")
      .innerJoin("user_roles", "ur", "ur.role_id = role.id")
      .where("ur.user_id = :userId", { userId })
      .select(["permission.name"])
      .getRawMany<{ permission_name: string }>();

    return [...new Set(roles.map((r) => r.permission_name))];
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }
}
