import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { Quote } from '../../types';
import {
  FileText,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/TableSkeleton';
import { useTable } from '../../hooks/useTable';
import { useDebounce } from '../../hooks/useDebounce';
import { exportToCSV } from '../../lib/export';

export default function QuotesTable() {
  const { t } = useTranslation();
  const {
    data: quotes,
    loading,
    page,
    setPage,
    pagination,
    refetch,
    filters,
    setFilters,
    sort,
    setSort
  } = useTable<Quote>('/api/admin/quotes');

  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch, setFilters]);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === quotes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(quotes.map(q => q.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkStatusUpdate = async (status: Quote['status']) => {
    if (!window.confirm(`Update ${selectedIds.length} quotes to ${status}?`)) return;
    setUpdatingId('bulk');
    try {
      await Promise.all(selectedIds.map(id => api.patch(`/api/admin/quotes/${id}/status`, { status })));
      toast.success(`Updated ${selectedIds.length} quotes`);
      setSelectedIds([]);
      await refetch();
    } catch (error) {
      toast.error('Failed to update some quotes');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} quotes? This cannot be undone.`)) return;
    setUpdatingId('bulk');
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/api/admin/quotes/${id}`)));
      toast.success(`Deleted ${selectedIds.length} quotes`);
      setSelectedIds([]);
      await refetch();
    } catch (error) {
      toast.error('Failed to delete some quotes');
    } finally {
      setUpdatingId(null);
    }
  };

  const updateStatus = async (id: string, status: Quote['status']) => {
    setUpdatingId(id);
    try {
      await api.patch(`/api/admin/quotes/${id}/status`, { status });
      toast.success(`Quote status updated to ${status}`);
      await refetch();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update status';
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusIcon = (status: Quote['status']) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'REVIEWING': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'APPROVED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-red" />
          {t('dashboard.admin.sections.quotes.title')}
        </h2>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search quotes..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-bg-secondary border border-border-primary rounded-xl pl-10 pr-4 py-2 text-xs font-bold focus:outline-none focus:border-brand-red/50 transition-colors w-full md:w-64"
            />
          </div>

          <div className="flex items-center gap-2 bg-bg-secondary px-3 py-2 rounded-xl border border-border-primary">
            <Filter className="w-4 h-4 text-text-tertiary" />
            <select 
              value={filters.status || 'all'} 
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-transparent border-none text-xs font-bold uppercase tracking-wider focus:ring-0 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="REVIEWING">Reviewing</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <button
            onClick={() => exportToCSV(quotes, 'quotes_export')}
            className="p-2 bg-bg-secondary hover:bg-bg-tertiary text-text-secondary rounded-xl border border-border-primary transition-colors"
            title="Download CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          {!loading && pagination.total > 0 && (
            <span className="text-xs text-text-tertiary uppercase tracking-widest">
              {pagination.total} {t('dashboard.common.total')}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : quotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t('dashboard.common.noData')}
          description="Quote requests will appear here once customers submit them through the website."
        />
      ) : (
        <>
          {/* Bulk Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-6 bg-bg-primary border border-brand-red/30 px-8 py-4 rounded-2xl shadow-2xl shadow-brand-red/20 animate-in slide-in-from-bottom-10 duration-300">
              <span className="text-sm font-black uppercase tracking-widest text-brand-red whitespace-nowrap">
                {selectedIds.length} SELECTED
              </span>
              <div className="h-4 w-px bg-border-primary" />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkStatusUpdate('REVIEWING')}
                  className="px-4 py-2 hover:bg-blue-500/10 text-blue-400 text-xs font-bold uppercase rounded-lg transition-colors"
                >
                  Review
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('APPROVED')}
                  className="px-4 py-2 hover:bg-green-500/10 text-green-400 text-xs font-bold uppercase rounded-lg transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 hover:bg-red-500/10 text-red-500 text-xs font-bold uppercase rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
              <button 
                onClick={() => setSelectedIds([])}
                className="p-2 hover:bg-bg-secondary rounded-lg text-text-tertiary transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                  <th className="px-6 py-2 w-10">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length === quotes.length && quotes.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-brand-red rounded bg-bg-secondary border-border-primary"
                    />
                  </th>
                  <th className="px-6 py-2">Customer / Vehicle</th>
                  <th className="px-6 py-2">Service</th>
                  <th 
                    className="px-6 py-2 cursor-pointer hover:text-text-primary transition-colors"
                    onClick={() => setSort({ 
                      field: 'status', 
                      order: sort?.field === 'status' && sort.order === 'asc' ? 'desc' : 'asc' 
                    })}
                  >
                    <div className="flex items-center gap-1">
                      {t('dashboard.common.status')}
                      {sort?.field === 'status' ? (
                        sort.order === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-2 cursor-pointer hover:text-text-primary transition-colors"
                    onClick={() => setSort({ 
                      field: 'createdAt', 
                      order: sort?.field === 'createdAt' && sort.order === 'desc' ? 'asc' : 'desc' 
                    })}
                  >
                    <div className="flex items-center gap-1">
                      {t('dashboard.common.date')}
                      {sort?.field === 'createdAt' ? (
                        sort.order === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>
                  <th className="px-6 py-2 text-right">{t('dashboard.common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote.id} className={cn(
                    "card-dark group hover:bg-bg-secondary transition-colors",
                    selectedIds.includes(quote.id) && "border-brand-red/30 bg-brand-red/5 shadow-lg shadow-brand-red/5"
                  )}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(quote.id)}
                        onChange={() => toggleSelect(quote.id)}
                        className="w-4 h-4 accent-brand-red rounded bg-bg-secondary border-border-primary"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-text-primary">{quote.name}</div>
                      <div className="text-xs text-text-tertiary">{quote.brand} {quote.model} ({quote.year})</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{quote.serviceType}</div>
                      <div className="text-xs text-text-tertiary truncate max-w-[200px]">{quote.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(quote.status)}
                        <span className={cn(
                          "text-xs font-bold uppercase tracking-wider",
                          quote.status === 'PENDING' && "text-yellow-500",
                          quote.status === 'REVIEWING' && "text-blue-500",
                          quote.status === 'APPROVED' && "text-green-500",
                          quote.status === 'REJECTED' && "text-red-500"
                        )}>
                          {quote.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-text-tertiary">
                        {format(new Date(quote.createdAt), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {quote.status === 'PENDING' && (
                          <button
                            onClick={() => updateStatus(quote.id, 'REVIEWING')}
                            disabled={!!updatingId}
                            className="p-2 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors disabled:opacity-50"
                            title="Mark as Reviewing"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                        {quote.status !== 'APPROVED' && (
                          <button
                            onClick={() => updateStatus(quote.id, 'APPROVED')}
                            disabled={!!updatingId}
                            className="p-2 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 hover:bg-bg-secondary text-text-secondary rounded-lg transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
