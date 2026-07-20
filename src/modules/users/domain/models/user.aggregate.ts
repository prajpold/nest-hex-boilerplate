import { AggregateRoot } from "@nestjs/cqrs";

import { UserRegisteredEvent } from "@modules/users/domain/events/user-registered.event";
import { Email } from "@modules/users/domain/value-objects/email.vo";
import { HashedPassword } from "@modules/users/domain/value-objects/hashed-password.vo";
import { UserId } from "@modules/users/domain/value-objects/user-id.vo";

export class User extends AggregateRoot {
  private constructor(
    private readonly id: UserId,
    private email: Email,
    private password: HashedPassword,
    private isActive: boolean,
  ) {
    super();
  }

  static register(email: Email, password: HashedPassword): User {
    const user = new User(UserId.create(), email, password, true);
    user.apply(new UserRegisteredEvent(user.id.toString(), email.toString()));
    return user;
  }

  static reconstitute(id: string, email: Email, password: HashedPassword, isActive: boolean): User {
    return new User(UserId.reconstitute(id), email, password, isActive);
  }

  changePassword(newPassword: HashedPassword): void {
    this.password = newPassword;
  }

  deactivate(): void {
    this.isActive = false;
  }

  get userId(): UserId {
    return this.id;
  }

  get userEmail(): Email {
    return this.email;
  }

  get hashedPassword(): HashedPassword {
    return this.password;
  }

  get active(): boolean {
    return this.isActive;
  }
}
