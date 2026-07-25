import { ApiProperty } from "@nestjs/swagger";

import { User } from "@modules/users/domain/models/user.aggregate";

export class UserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  isActive!: boolean;

  static fromDomain(user: User): UserDto {
    const dto = new UserDto();
    dto.id = user.userId.toValue();
    dto.email = user.userEmail.toString();
    dto.isActive = user.active;
    return dto;
  }
}
