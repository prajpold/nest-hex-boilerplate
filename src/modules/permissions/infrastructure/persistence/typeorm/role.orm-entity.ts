import { Column, Entity, JoinTable, ManyToMany } from "typeorm";

import { BaseOrmEntity } from "@shared/infrastructure/database/base.orm-entity";

import { PermissionOrmEntity } from "./permission.orm-entity";

@Entity("roles")
export class RoleOrmEntity extends BaseOrmEntity {
  @Column({ unique: true })
  name!: string;

  @ManyToMany(() => PermissionOrmEntity)
  @JoinTable({
    name: "role_permissions",
    joinColumn: { name: "role_id" },
    inverseJoinColumn: { name: "permission_id" },
  })
  permissions!: PermissionOrmEntity[];
}
