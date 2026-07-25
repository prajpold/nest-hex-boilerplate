import { EventPublisher } from "@nestjs/cqrs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PasswordHasherPort } from "@modules/users/application/ports/password-hasher.port";
import { UserAlreadyExistsError } from "@modules/users/domain/errors/user-already-exists.error";
import { User } from "@modules/users/domain/models/user.aggregate";
import { UserRepository } from "@modules/users/domain/ports/user.repository";
import { Email } from "@modules/users/domain/value-objects/email.vo";
import { HashedPassword } from "@modules/users/domain/value-objects/hashed-password.vo";

import { RegisterUserCommand } from "./register-user.command";
import { RegisterUserHandler } from "./register-user.handler";

describe("RegisterUserHandler", () => {
  let handler: RegisterUserHandler;
  let userRepository: UserRepository;
  let passwordHasher: PasswordHasherPort;
  let saveMock: ReturnType<typeof vi.fn<(user: User) => Promise<void>>>;
  let findByEmailMock: ReturnType<typeof vi.fn<(email: Email) => Promise<User | null>>>;
  let hashMock: ReturnType<typeof vi.fn<(plainPassword: string) => Promise<string>>>;

  beforeEach(() => {
    saveMock = vi.fn<(user: User) => Promise<void>>();
    findByEmailMock = vi.fn<(email: Email) => Promise<User | null>>().mockResolvedValue(null);
    hashMock = vi
      .fn<(plainPassword: string) => Promise<string>>()
      .mockResolvedValue("hashed-password");

    userRepository = {
      save: saveMock,
      findById: vi.fn(),
      findByEmail: findByEmailMock,
      findAll: vi.fn(),
    };

    passwordHasher = {
      hash: hashMock,
      compare: vi.fn(),
    };

    const publisher = {
      mergeObjectContext: vi.fn((user: User) => user),
    };

    handler = new RegisterUserHandler(
      userRepository,
      passwordHasher,
      publisher as unknown as EventPublisher,
    );
  });

  it("registers a new user and returns their id", async () => {
    const command = new RegisterUserCommand("new@example.com", "password123");

    const userId = await handler.execute(command);

    expect(userId).toBeDefined();
    expect(hashMock).toHaveBeenCalledWith("password123");
    expect(saveMock).toHaveBeenCalledOnce();
  });

  it("throws UserAlreadyExistsError if email is taken", async () => {
    const existingUser = User.register(
      Email.create("taken@example.com"),
      HashedPassword.fromHash("hashed-password"),
    );
    findByEmailMock.mockResolvedValue(existingUser);

    const command = new RegisterUserCommand("taken@example.com", "password123");

    await expect(handler.execute(command)).rejects.toThrow(UserAlreadyExistsError);
    expect(hashMock).not.toHaveBeenCalled();
    expect(saveMock).not.toHaveBeenCalled();
  });
});
