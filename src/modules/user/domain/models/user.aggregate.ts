import { AggregateRoot } from "@nestjs/cqrs";
import { randomUUID } from "crypto";

import { UserRegisteredEvent } from "@modules/user/domain/events/user-registered.event";
import { Email } from "@modules/user/domain/value-objects/email.vo";
import { HashedPassword } from "@modules/user/domain/value-objects/hashed-password.vo";

export class User extends AggregateRoot {
  private constructor(
    private readonly id: string,
    private email: Email,
    private password: HashedPassword,
    private isActive: boolean,
  ) {
    super();
  }

  static register(email: Email, password: HashedPassword): User {
    const user = new User(randomUUID(), email, password, true);
    user.apply(new UserRegisteredEvent(user.id, email.toString()));
    return user;
  }

  static reconstitute(id: string, email: Email, password: HashedPassword, isActive: boolean): User {
    return new User(id, email, password, isActive);
  }

  changePassword(newPassword: HashedPassword): void {
    this.password = newPassword;
  }

  deactivate(): void {
    this.isActive = false;
  }

  get userId(): string {
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
