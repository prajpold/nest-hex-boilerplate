import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PermissionOrmEntity } from "@modules/permissions/infrastructure/persistence/typeorm/permission.orm-entity";
import { RoleOrmEntity } from "@modules/permissions/infrastructure/persistence/typeorm/role.orm-entity";
import { TypeOrmPermissionChecker } from "@modules/permissions/infrastructure/security/typeorm-permission-checker.adapter";
import { TypeOrmRoleAssigner } from "@modules/permissions/infrastructure/security/typeorm-role-assigner.adapter";
import { PERMISSION_CHECKER, ROLE_ASSIGNER } from "@modules/permissions/permissions.tokens";

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([RoleOrmEntity, PermissionOrmEntity])],
  providers: [
    { provide: PERMISSION_CHECKER, useClass: TypeOrmPermissionChecker },
    { provide: ROLE_ASSIGNER, useClass: TypeOrmRoleAssigner },
  ],
  exports: [PERMISSION_CHECKER, ROLE_ASSIGNER],
})
export class PermissionsModule {}
