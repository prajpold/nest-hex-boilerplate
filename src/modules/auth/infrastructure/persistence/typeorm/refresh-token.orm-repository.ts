import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, Repository } from "typeorm";

import { RefreshTokenRepository } from "@modules/auth/domain/ports/refresh-token.repository";

import { RefreshTokenOrmEntity } from "./refresh-token.orm-entity";

@Injectable()
export class RefreshTokenTypeOrmRepository implements RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly repo: Repository<RefreshTokenOrmEntity>,
  ) {}

  async store(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.repo.save({ userId, tokenHash, expiresAt, revoked: false });
  }

  async findValidByHash(tokenHash: string): Promise<{ userId: string } | null> {
    const found = await this.repo.findOne({
      where: { tokenHash, revoked: false, expiresAt: MoreThan(new Date()) },
    });
    return found ? { userId: found.userId } : null;
  }

  async revoke(tokenHash: string): Promise<void> {
    await this.repo.update({ tokenHash }, { revoked: true });
  }
}
