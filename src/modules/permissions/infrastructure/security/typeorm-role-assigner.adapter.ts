import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

import { RoleAssignerPort } from "@modules/permissions/domain/ports/role-assigner.port";
import { RoleOrmEntity } from "@modules/permissions/infrastructure/persistence/typeorm/role.orm-entity";

const DEFAULT_ROLE_NAME = "viewer";

@Injectable()
export class TypeOrmRoleAssigner implements RoleAssignerPort {
  constructor(
    @InjectRepository(RoleOrmEntity) private readonly roleRepo: Repository<RoleOrmEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async assignDefaultRole(userId: string): Promise<void> {
    const defaultRole = await this.roleRepo.findOne({ where: { name: DEFAULT_ROLE_NAME } });

    if (!defaultRole) {
      throw new Error(`Default role "${DEFAULT_ROLE_NAME}" not found — did you run seeds?`);
    }

    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into("user_roles")
      .values({ user_id: userId, role_id: defaultRole.id })
      .execute();
  }
}
