import { Column, Entity } from "typeorm";

import { BaseOrmEntity } from "@shared/infrastructure/database/base.orm-entity";

@Entity("users")
export class UserOrmEntity extends BaseOrmEntity {
  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ default: true })
  isActive!: boolean;
}
