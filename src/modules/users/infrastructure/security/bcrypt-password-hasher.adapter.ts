import { Injectable } from "@nestjs/common";
import { compare, hash } from "bcrypt";

import { PasswordHasherPort } from "@modules/users/application/ports/password-hasher.port";

@Injectable()
export class BcryptPasswordHasher implements PasswordHasherPort {
  private readonly saltRounds = 12;

  hash(plainPassword: string): Promise<string> {
    return hash(plainPassword, this.saltRounds);
  }

  compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return compare(plainPassword, hashedPassword);
  }
}
