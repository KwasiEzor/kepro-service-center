import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { ApiResponse } from '../types';

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface TableOptions {
  initialLimit?: number;
  initialFilters?: Record<string, any>;
  initialSort?: { field: string; order: 'asc' | 'desc' };
}

export function useTable<T>(endpoint: string, options: TableOptions = {}) {
  const { initialLimit = 20, initialFilters = {}, initialSort } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const [sort, setSort] = useState<{ field: string; order: 'asc' | 'desc' } | undefined>(initialSort);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: initialLimit,
    pages: 0
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', initialLimit.toString());

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        params.append(key, value.toString());
      }
    });

    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortOrder', sort.order);
    }

    return params.toString();
  }, [page, initialLimit, filters, sort]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const baseUrl = endpoint.split('?')[0];
      const existingParams = new URLSearchParams(endpoint.split('?')[1] || '');
      
      // Merge initial endpoint params with our managed params
      const finalParams = new URLSearchParams(queryString);
      existingParams.forEach((value, key) => {
        if (!finalParams.has(key)) {
          finalParams.append(key, value);
        }
      });

      const response = await api.get<ApiResponse<{ data: T[], pagination: PaginationData }>>(
        `${baseUrl}?${finalParams.toString()}`
      );
      
      const result = response.data.data;
      if (result) {
        setData(result.data || []);
        setPagination(result.pagination || { 
          total: (result.data || []).length, 
          page: 1, 
          limit: initialLimit, 
          pages: 1 
        });
      }
      setError(null);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to load data';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, queryString, initialLimit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters, sort]);

  return {
    data,
    loading,
    error,
    page,
    setPage,
    filters,
    setFilters,
    sort,
    setSort,
    pagination,
    refetch: fetchData,
    setData
  };
}
