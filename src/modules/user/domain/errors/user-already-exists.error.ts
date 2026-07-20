import { DomainError } from "@shared/domain/domain-error.base";

export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`User with email "${email}" already exists`);
  }
}
