import { PaginatedApiResponse, PaginationMeta } from "./api-response";

export class PaginationParams {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

export function buildPaginatedResult<T>(
  items: T[],
  totalItems: number,
  params: PaginationParams,
): PaginatedApiResponse<T> {
  const meta = {
    page: params.page,
    limit: params.limit,
    totalItems,
    totalPages: Math.ceil(totalItems / params.limit),
  } as const satisfies PaginationMeta;

  return { data: items, meta };
}
