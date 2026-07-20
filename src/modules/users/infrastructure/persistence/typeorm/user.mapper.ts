import { User } from "@modules/users/domain/models/user.aggregate";
import { Email } from "@modules/users/domain/value-objects/email.vo";
import { HashedPassword } from "@modules/users/domain/value-objects/hashed-password.vo";

import { UserOrmEntity } from "./user.orm-entity";

export class UserMapper {
  static toDomain(orm: UserOrmEntity): User {
    return User.reconstitute(
      orm.id,
      Email.create(orm.email),
      HashedPassword.fromHash(orm.passwordHash),
      orm.isActive,
    );
  }

  static toOrm(user: User): Partial<UserOrmEntity> {
    return {
      id: user.userId.toString(),
      email: user.userEmail.toString(),
      passwordHash: user.hashedPassword.toString(),
      isActive: user.active,
    };
  }
}
