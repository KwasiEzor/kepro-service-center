import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { ApiResponse } from '../types';

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function useTable<T>(endpoint: string, initialLimit = 20) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: initialLimit,
    pages: 0
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<{ data: T[], pagination: PaginationData }>>(
        `${endpoint}${endpoint.includes('?') ? '&' : '?'}page=${page}&limit=${initialLimit}`
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
  }, [endpoint, page, initialLimit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    page,
    setPage,
    pagination,
    refetch: fetchData,
    setData // Useful for optimistic updates
  };
}
