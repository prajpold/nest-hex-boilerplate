import { InvalidEmailError } from "@modules/user/domain/errors/invalid-email.error";
import { ValueObject } from "@shared/domain/value-object.base";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalized)) {
      throw new InvalidEmailError(raw);
    }

    return new Email(normalized);
  }
}
