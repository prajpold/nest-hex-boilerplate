import { Inject } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { createHash } from "crypto";

import {
  type TokenGeneratorPort,
  TokenPair,
} from "@modules/auth/application/ports/token-generator.port";
import { REFRESH_TOKEN_REPOSITORY, TOKEN_GENERATOR } from "@modules/auth/auth.tokens";
import { InvalidCredentialsError } from "@modules/auth/domain/errors/invalid-credentials.error";
import { type RefreshTokenRepository } from "@modules/auth/domain/ports/refresh-token.repository";
import { type PasswordHasherPort } from "@modules/users/application/ports/password-hasher.port";
import { type UserRepository } from "@modules/users/domain/ports/user.repository";
import { Email } from "@modules/users/domain/value-objects/email.vo";
import { PASSWORD_HASHER, USER_REPOSITORY } from "@modules/users/users.tokens";

import { LoginCommand } from "./login.command";

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasherPort,
    @Inject(TOKEN_GENERATOR) private readonly tokenGenerator: TokenGeneratorPort,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(command: LoginCommand): Promise<TokenPair> {
    const email = Email.create(command.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isValid = await this.passwordHasher.compare(
      command.plainPassword,
      user.hashedPassword.toString(),
    );

    if (!isValid) {
      throw new InvalidCredentialsError();
    }

    const userId = user.userId.toString();
    const tokens = this.tokenGenerator.generateTokenPair(userId);

    const refreshTokenHash = createHash("sha256").update(tokens.refreshToken).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dni — docelowo z configu

    await this.refreshTokenRepository.store(userId, refreshTokenHash, expiresAt);

    return tokens;
  }
}
