export class RegisterUserCommand {
  constructor(
    public readonly email: string,
    public readonly plainPassword: string,
  ) {}
}
