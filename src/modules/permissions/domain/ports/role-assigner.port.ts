export interface RoleAssignerPort {
  assignDefaultRole(userId: string): Promise<void>;
}
