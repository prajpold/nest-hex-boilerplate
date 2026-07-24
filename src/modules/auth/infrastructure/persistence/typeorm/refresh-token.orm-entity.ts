import { Column, Entity, Index } from "typeorm";

import { BaseOrmEntity } from "@shared/infrastructure/database/base.orm-entity";

@Entity("refresh_tokens")
export class RefreshTokenOrmEntity extends BaseOrmEntity {
  @Index()
  @Column()
  userId!: string;

  @Column()
  tokenHash!: string;

  @Column()
  expiresAt!: Date;

  @Column({ default: false })
  revoked!: boolean;
}
