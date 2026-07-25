import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { Public } from "@modules/auth/infrastructure/http/decorators/public.decorator";
import { RequirePermissions } from "@modules/permissions/infrastructure/http/decorators/require-permissions.decorator";
import { RegisterUserCommand } from "@modules/users/application/commands/register-user/register-user.command";
import { UserDto } from "@modules/users/application/dto/user.dto";
import { GetUserByIdQuery } from "@modules/users/application/queries/get-user-by-id/get-user-by-id.query";
import { ListUsersQuery } from "@modules/users/application/queries/list-users/list-users.query";
import { PaginationParams } from "@shared/kernel/pagination";

import { RegisterUserRequestDto } from "./dto/register-user.request.dto";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Post()
  @ApiOperation({ summary: "Register a new user" })
  @ApiCreatedResponse({
    description: "User registered successfully",
    schema: { example: { data: { id: "0198a7d7-51c9-7000-8000-000000000000" } } },
  })
  @ApiBadRequestResponse({ description: "Invalid registration payload" })
  @ApiConflictResponse({ description: "A user with this email already exists" })
  async register(@Body() dto: RegisterUserRequestDto) {
    const id = await this.commandBus.execute(new RegisterUserCommand(dto.email, dto.password));
    return { data: { id } };
  }

  @RequirePermissions("users:read")
  @Get(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user by id" })
  @ApiParam({ name: "id", description: "User UUID v7", format: "uuid" })
  @ApiOkResponse({ description: "User data", type: UserDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token" })
  @ApiNotFoundResponse({ description: "User not found" })
  getOne(@Param("id") id: string) {
    return this.queryBus.execute(new GetUserByIdQuery(id));
  }

  @RequirePermissions("users:read")
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get paginated list of users" })
  @ApiQuery({ name: "page", required: false, type: Number, minimum: 1, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, minimum: 1, example: 20 })
  @ApiOkResponse({
    description: "Paginated users data",
    schema: {
      example: {
        data: [
          { id: "0198a7d7-51c9-7000-8000-000000000000", email: "user@example.com", isActive: true },
        ],
        meta: { page: 1, limit: 20, totalItems: 1, totalPages: 1 },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token" })
  list(@Query("page") page?: string, @Query("limit") limit?: string) {
    const params = new PaginationParams(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
    return this.queryBus.execute(new ListUsersQuery(params));
  }
}
