import { DomainError } from "@shared/domain/domain-error.base";

export class WeakPasswordError extends DomainError {
  constructor() {
    super("Password does not meet minimum security requirements");
  }
}
