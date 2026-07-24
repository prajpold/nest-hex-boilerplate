import { DomainError } from "@shared/domain/domain-error.base";

export class InvalidRefreshTokenError extends DomainError {
  constructor() {
    super("Refresh token is invalid or expired");
  }
}
