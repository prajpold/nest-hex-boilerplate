import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PermissionsModule } from "@modules/permissions/permissions.module";
import { RegisterUserHandler } from "@modules/users/application/commands/register-user/register-user.handler";
import { GetUserByIdHandler } from "@modules/users/application/queries/get-user-by-id/get-user-by-id.handler";
import { ListUsersHandler } from "@modules/users/application/queries/list-users/list-users.handler";
import { UsersController } from "@modules/users/infrastructure/http/users.controller";
import { UserOrmEntity } from "@modules/users/infrastructure/persistence/typeorm/user.orm-entity";
import { UserTypeOrmRepository } from "@modules/users/infrastructure/persistence/typeorm/user.orm-repository";
import { BcryptPasswordHasher } from "@modules/users/infrastructure/security/bcrypt-password-hasher.adapter";
import { PASSWORD_HASHER, USER_REPOSITORY } from "@modules/users/users.tokens";

@Module({
  imports: [CqrsModule, PermissionsModule, TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UsersController],
  providers: [
    RegisterUserHandler,
    GetUserByIdHandler,
    ListUsersHandler,
    { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
  ],
  exports: [USER_REPOSITORY, PASSWORD_HASHER],
})
export class UsersModule {}
