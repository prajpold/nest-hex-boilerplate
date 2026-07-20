import { DomainError } from "@shared/domain/domain-error.base";

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`"${email}" is not a valid email address`);
  }
}
