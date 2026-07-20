import { User } from "@modules/users/domain/models/user.aggregate";
import { UserId } from "@modules/users/domain/value-objects/user-id.vo";

export class UserDto {
  id!: UserId;
  email!: string;
  isActive!: boolean;

  static fromDomain(user: User): UserDto {
    const dto = new UserDto();
    dto.id = user.userId;
    dto.email = user.userEmail.toString();
    dto.isActive = user.active;
    return dto;
  }
}
