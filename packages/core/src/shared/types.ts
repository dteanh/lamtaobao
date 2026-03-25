export type ServiceResult<T> = {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
};

export type PaginationInput = {
  page?: number;
  pageSize?: number;
};

export * from './result';
