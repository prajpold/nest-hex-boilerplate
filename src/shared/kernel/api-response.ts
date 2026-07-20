export interface ApiResponse<D, M> {
  data: D;
  meta?: M;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedApiResponse<D> extends ApiResponse<D[], PaginationMeta> {}
