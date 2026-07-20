import { User } from "@modules/users/domain/models/user.aggregate";
import { Email } from "@modules/users/domain/value-objects/email.vo";
import { PaginationParams } from "@shared/kernel/pagination";

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findAll(params: PaginationParams): Promise<{ users: User[]; total: number }>;
}
