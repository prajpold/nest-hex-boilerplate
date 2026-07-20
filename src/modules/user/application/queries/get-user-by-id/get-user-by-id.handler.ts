import { Inject, NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { UserDto } from "@modules/user/application/dto/user.dto";
import { type UserRepository } from "@modules/user/domain/ports/user.repository";
import { USER_REPOSITORY } from "@modules/user/user.tokens";

import { GetUserByIdQuery } from "./get-user-by-id.query";

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

  async execute(query: GetUserByIdQuery): Promise<UserDto> {
    const user = await this.userRepository.findById(query.userId);

    if (!user) {
      throw new NotFoundException(`User with id "${query.userId}" not found`);
    }

    return UserDto.fromDomain(user);
  }
}
