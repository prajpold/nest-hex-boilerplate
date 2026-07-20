import { User } from "@modules/users/domain/models/user.aggregate";

export class UserDto {
  id!: string;
  email!: string;
  isActive!: boolean;

  static fromDomain(user: User): UserDto {
    const dto = new UserDto();
    dto.id = user.userId.toValue();
    dto.email = user.userEmail.toString();
    dto.isActive = user.active;
    return dto;
  }
}
