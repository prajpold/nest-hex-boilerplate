import { Inject } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { UserDto } from "@modules/user/application/dto/user.dto";
import { type UserRepository } from "@modules/user/domain/ports/user.repository";
import { USER_REPOSITORY } from "@modules/user/user.tokens";
import { PaginatedApiResponse } from "@shared/kernel/api-response";
import { buildPaginatedResult } from "@shared/kernel/pagination";

import { ListUsersQuery } from "./list-users.query";

@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<ListUsersQuery> {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

  async execute(query: ListUsersQuery): Promise<PaginatedApiResponse<UserDto>> {
    const { users, total } = await this.userRepository.findAll(query.pagination);
    const dtos = users.map((user) => UserDto.fromDomain(user));

    return buildPaginatedResult(dtos, total, query.pagination);
  }
}
