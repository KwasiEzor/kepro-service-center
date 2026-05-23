import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { Quote, QuoteStatus } from '../../types';
import {
  FileText,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/TableSkeleton';
import { useTable } from '../../hooks/useTable';
import { useDebounce } from '../../hooks/useDebounce';
import { useBulkActions } from '../../hooks/useBulkActions';
import { exportToCSV } from '../../lib/export';
import { TableToolbar } from '../../components/dashboard/TableToolbar';
import { BulkActionsBar } from '../../components/dashboard/BulkActionsBar';
import { TableHeader } from '../../components/dashboard/TableHeader';

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

  const {
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    handleBulkAction,
    isProcessing: bulkProcessing
  } = useBulkActions('/api/admin/quotes', quotes, { onSuccess: refetch });

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
      case QuoteStatus.REVIEWING: return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case QuoteStatus.APPROVED: return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <TableToolbar 
        title={t('dashboard.admin.sections.quotes.title')}
        icon={FileText}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        statusValue={filters.status || 'all'}
        onStatusChange={(status) => setFilters({ ...filters, status })}
        statusOptions={[
          { label: 'All Status', value: 'all' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'Reviewing', value: QuoteStatus.REVIEWING },
          { label: 'Approved', value: QuoteStatus.APPROVED },
          { label: 'Rejected', value: 'REJECTED' },
        ]}
        onExport={() => exportToCSV(quotes, 'quotes_export')}
        totalItems={pagination.total}
        loading={loading}
      />

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
          <BulkActionsBar 
            selectedCount={selectedIds.length}
            onClear={clearSelection}
            actions={[
              { label: 'Review', onClick: () => handleBulkAction('patch', { status: QuoteStatus.REVIEWING }, undefined, '/status'), variant: 'blue' },
              { label: 'Approve', onClick: () => handleBulkAction('patch', { status: QuoteStatus.APPROVED }, undefined, '/status'), variant: 'success' },
              { label: 'Delete', onClick: () => handleBulkAction('delete'), variant: 'danger' },
            ]}
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <TableHeader 
                showCheckbox
                checkboxChecked={selectedIds.length === quotes.length && quotes.length > 0}
                onCheckboxChange={toggleSelectAll}
                currentSort={sort as any}
                onSort={(field) => setSort({ 
                  field, 
                  order: sort?.field === field && sort.order === 'asc' ? 'desc' : 'asc' 
                })}
                columns={[
                  { label: 'Customer / Vehicle' },
                  { label: 'Service' },
                  { label: t('dashboard.common.status'), field: 'status', sortable: true },
                  { label: t('dashboard.common.date'), field: 'createdAt', sortable: true },
                  { label: t('dashboard.common.actions'), className: 'text-right' }
                ]}
              />
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
                          quote.status === QuoteStatus.REVIEWING && "text-blue-500",
                          quote.status === QuoteStatus.APPROVED && "text-green-500",
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
                            onClick={() => updateStatus(quote.id, QuoteStatus.REVIEWING)}
                            disabled={!!updatingId || bulkProcessing}
                            className="p-2 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors disabled:opacity-50"
                            title="Mark as Reviewing"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                        {quote.status !== QuoteStatus.APPROVED && (
                          <button
                            onClick={() => updateStatus(quote.id, QuoteStatus.APPROVED)}
                            disabled={!!updatingId || bulkProcessing}
                            className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors disabled:opacity-50"
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
