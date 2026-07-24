import { DomainError } from "@shared/domain/domain-error.base";

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super("Invalid email or password");
  }
}
