import { ApiError } from './api-error.interface';

export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    total: number;
    limit: number;
    hasMore: boolean;
    after?: string;
  };
  errors?: ApiError[];
}
