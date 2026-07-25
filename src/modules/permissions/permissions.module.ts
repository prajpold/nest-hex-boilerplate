import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PermissionOrmEntity } from "@modules/permissions/infrastructure/persistence/typeorm/permission.orm-entity";
import { RoleOrmEntity } from "@modules/permissions/infrastructure/persistence/typeorm/role.orm-entity";
import { TypeOrmPermissionChecker } from "@modules/permissions/infrastructure/security/typeorm-permission-checker.adapter";
import { PERMISSION_CHECKER } from "@modules/permissions/permissions.tokens";

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([RoleOrmEntity, PermissionOrmEntity])],
  providers: [{ provide: PERMISSION_CHECKER, useClass: TypeOrmPermissionChecker }],
  exports: [PERMISSION_CHECKER],
})
export class PermissionsModule {}
