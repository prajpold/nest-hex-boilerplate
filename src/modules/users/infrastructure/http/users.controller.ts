import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";

import { Public } from "@modules/auth/infrastructure/http/decorators/public.decorator";
import { RequirePermissions } from "@modules/permissions/infrastructure/http/decorators/require-permissions.decorator";
import { RegisterUserCommand } from "@modules/users/application/commands/register-user/register-user.command";
import { GetUserByIdQuery } from "@modules/users/application/queries/get-user-by-id/get-user-by-id.query";
import { ListUsersQuery } from "@modules/users/application/queries/list-users/list-users.query";
import { PaginationParams } from "@shared/kernel/pagination";

import { RegisterUserRequestDto } from "./dto/register-user.request.dto";

@Controller("users")
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Post()
  async register(@Body() dto: RegisterUserRequestDto) {
    const id = await this.commandBus.execute(new RegisterUserCommand(dto.email, dto.password));
    return { data: { id } };
  }

  @RequirePermissions("users:read")
  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.queryBus.execute(new GetUserByIdQuery(id));
  }

  @RequirePermissions("users:read")
  @Get()
  list(@Query("page") page?: string, @Query("limit") limit?: string) {
    const params = new PaginationParams(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
    return this.queryBus.execute(new ListUsersQuery(params));
  }
}
