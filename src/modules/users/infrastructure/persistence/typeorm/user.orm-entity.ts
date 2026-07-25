import { Column, Entity, JoinTable, ManyToMany } from "typeorm";

import { RoleOrmEntity } from "@modules/permissions/infrastructure/persistence/typeorm/role.orm-entity";
import { BaseOrmEntity } from "@shared/infrastructure/database/base.orm-entity";

@Entity("users")
export class UserOrmEntity extends BaseOrmEntity {
  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToMany(() => RoleOrmEntity)
  @JoinTable({
    name: "user_roles",
    joinColumn: { name: "user_id" },
    inverseJoinColumn: { name: "role_id" },
  })
  roles!: RoleOrmEntity[];
}
