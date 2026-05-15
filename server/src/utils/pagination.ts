import { Request } from 'express';

export interface PaginationParams {
  skip: number;
  take: number;
  page: number;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Extract pagination parameters from request query
 * @param req Express request
 * @param defaultLimit Default items per page (default: 50)
 * @param maxLimit Maximum items per page (default: 100)
 * @returns Pagination params for Prisma query
 */
export function getPaginationParams(
  req: Request,
  defaultLimit = 50,
  maxLimit = 100
): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(req.query.limit as string) || defaultLimit)
  );

  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
  };
}

/**
 * Create pagination metadata for response
 * @param page Current page number
 * @param perPage Items per page
 * @param total Total items count
 * @returns Pagination metadata
 */
export function createPaginationMeta(
  page: number,
  perPage: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / perPage);

  return {
    page,
    perPage,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Paginate response data with metadata
 * @param data Data array
 * @param pagination Pagination params
 * @param total Total count
 * @returns Paginated response object
 */
export function paginateResponse<T>(
  data: T[],
  pagination: PaginationParams,
  total: number
) {
  return {
    data,
    pagination: createPaginationMeta(pagination.page, pagination.take, total),
  };
}
