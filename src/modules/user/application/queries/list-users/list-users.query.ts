import { PaginationParams } from "@shared/kernel/pagination";

export class ListUsersQuery {
  constructor(public readonly pagination: PaginationParams) {}
}
