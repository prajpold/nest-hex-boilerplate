import { Inject } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";

import { type RoleAssignerPort } from "@modules/permissions/domain/ports/role-assigner.port";
import { ROLE_ASSIGNER } from "@modules/permissions/permissions.tokens";
import { RegisterUserCommand } from "@modules/users/application/commands/register-user/register-user.command";
import { type PasswordHasherPort } from "@modules/users/application/ports/password-hasher.port";
import { UserAlreadyExistsError } from "@modules/users/domain/errors/user-already-exists.error";
import { User } from "@modules/users/domain/models/user.aggregate";
import { type UserRepository } from "@modules/users/domain/ports/user.repository";
import { Email } from "@modules/users/domain/value-objects/email.vo";
import { HashedPassword } from "@modules/users/domain/value-objects/hashed-password.vo";
import { UserId } from "@modules/users/domain/value-objects/user-id.vo";
import { PASSWORD_HASHER, USER_REPOSITORY } from "@modules/users/users.tokens";

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasherPort,
    @Inject(ROLE_ASSIGNER) private readonly roleAssigner: RoleAssignerPort,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: RegisterUserCommand): Promise<UserId> {
    const email = Email.create(command.email);

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new UserAlreadyExistsError(command.email);
    }

    const hashedValue = await this.passwordHasher.hash(command.plainPassword);
    const password = HashedPassword.fromHash(hashedValue);

    const user = this.publisher.mergeObjectContext(User.register(email, password));

    await this.userRepository.save(user);
    await this.roleAssigner.assignDefaultRole(user.userId.toString());
    user.commit();

    return user.userId;
  }
}
