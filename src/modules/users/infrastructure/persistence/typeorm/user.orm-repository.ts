import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "@modules/users/domain/models/user.aggregate";
import { UserRepository } from "@modules/users/domain/ports/user.repository";
import { Email } from "@modules/users/domain/value-objects/email.vo";
import { PaginationParams } from "@shared/kernel/pagination";

import { UserMapper } from "./user.mapper";
import { UserOrmEntity } from "./user.orm-entity";

@Injectable()
export class UserTypeOrmRepository implements UserRepository {
  constructor(@InjectRepository(UserOrmEntity) private readonly repo: Repository<UserOrmEntity>) {}

  async save(user: User): Promise<void> {
    await this.repo.save(UserMapper.toOrm(user));
  }

  async findById(id: string): Promise<User | null> {
    const found = await this.repo.findOne({ where: { id } });
    return found ? UserMapper.toDomain(found) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const found = await this.repo.findOne({ where: { email: email.toString() } });
    return found ? UserMapper.toDomain(found) : null;
  }

  async findAll(params: PaginationParams): Promise<{ users: User[]; total: number }> {
    const [rows, total] = await this.repo.findAndCount({
      skip: params.skip,
      take: params.limit,
      order: { createdAt: "DESC" },
    });

    return { users: rows.map((row) => UserMapper.toDomain(row)), total };
  }
}
