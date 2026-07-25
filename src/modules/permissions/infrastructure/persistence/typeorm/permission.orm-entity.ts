import { Column, Entity } from "typeorm";

import { BaseOrmEntity } from "@shared/infrastructure/database/base.orm-entity";

@Entity("permissions")
export class PermissionOrmEntity extends BaseOrmEntity {
  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description?: string;
}
