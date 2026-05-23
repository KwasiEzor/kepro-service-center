import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { Invoice, InvoiceStatus } from '../../types';
import {
  FileText,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  Trash2,
  ArrowRight
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

export default function InvoicesTable() {
  const { t } = useTranslation();
  const {
    data: invoices,
    loading,
    page,
    setPage,
    pagination,
    refetch,
    filters,
    setFilters,
    sort,
    setSort
  } = useTable<Invoice>('/api/admin/invoices');

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
  } = useBulkActions('/api/admin/invoices', invoices, { onSuccess: refetch });

  const markAsPaid = async (id: string) => {
    if (!window.confirm('Mark this invoice as paid?')) return;
    setUpdatingId(id);
    try {
      await api.patch(`/api/admin/invoices/${id}/paid`, { paymentMethod: 'CASH' });
      toast.success('Invoice marked as paid');
      await refetch();
    } catch (error: any) {
      toast.error('Failed to update invoice');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!window.confirm('Delete this invoice? This cannot be undone.')) return;
    setUpdatingId(id);
    try {
      await api.delete(`/api/admin/invoices/${id}`);
      toast.success('Invoice deleted');
      await refetch();
    } catch (error: any) {
      toast.error('Failed to delete invoice');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case 'DRAFT': return <FileText className="w-4 h-4 text-text-tertiary" />;
      case 'SENT': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'PAID': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'OVERDUE': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4 text-text-tertiary opacity-50" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <TableToolbar 
        title={t('dashboard.admin.sections.invoices.title')}
        icon={FileText}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        statusValue={filters.status || 'all'}
        onStatusChange={(status) => setFilters({ ...filters, status })}
        statusOptions={[
          { label: 'All Status', value: 'all' },
          { label: 'Draft', value: 'DRAFT' },
          { label: 'Sent', value: 'SENT' },
          { label: 'Paid', value: 'PAID' },
          { label: 'Overdue', value: 'OVERDUE' },
        ]}
        onExport={() => exportToCSV(invoices, 'invoices_export')}
        totalItems={pagination.total}
        loading={loading}
      />

      {loading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t('dashboard.common.noData')}
          description="Invoices will appear here once you create them from quotes."
        />
      ) : (
        <>
          <BulkActionsBar 
            selectedCount={selectedIds.length}
            onClear={clearSelection}
            actions={[
              { label: 'Mark Paid', onClick: () => handleBulkAction('patch', { paymentMethod: 'CASH' }, 'Invoices marked as paid', '/paid'), variant: 'success' },
              { label: 'Delete', onClick: () => handleBulkAction('delete'), variant: 'danger' },
            ]}
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <TableHeader 
                showCheckbox
                checkboxChecked={selectedIds.length === invoices.length && invoices.length > 0}
                onCheckboxChange={toggleSelectAll}
                currentSort={sort as any}
                onSort={(field) => setSort({ 
                  field, 
                  order: sort?.field === field && sort.order === 'asc' ? 'desc' : 'asc' 
                })}
                columns={[
                  { label: 'Invoice #' },
                  { label: 'Customer' },
                  { label: 'Amount', field: 'total', sortable: true },
                  { label: t('dashboard.common.status'), field: 'status', sortable: true },
                  { label: 'Due Date', field: 'dueDate', sortable: true },
                  { label: t('dashboard.common.actions'), className: 'text-right' }
                ]}
              />
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className={cn(
                    "card-dark group hover:bg-bg-secondary transition-colors",
                    selectedIds.includes(invoice.id) && "border-brand-red/30 bg-brand-red/5 shadow-lg shadow-brand-red/5"
                  )}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(invoice.id)}
                          onChange={() => toggleSelect(invoice.id)}
                          className="w-4 h-4 accent-brand-red rounded bg-bg-secondary border-border-primary"
                        />
                        <div className="font-bold text-text-primary">{invoice.invoiceNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-text-secondary">{invoice.quote?.name || 'Customer'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-text-primary">€{invoice.total.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invoice.status)}
                        <span className={cn(
                          "text-xs font-bold uppercase tracking-wider",
                          invoice.status === 'PAID' ? "text-green-500" : "text-text-tertiary"
                        )}>
                          {invoice.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-text-tertiary">
                        {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.status !== 'PAID' && (
                          <button
                            onClick={() => markAsPaid(invoice.id)}
                            disabled={!!updatingId || bulkProcessing}
                            className="p-2 hover:bg-green-500/10 text-green-500 rounded-lg transition-colors"
                            title="Mark as Paid"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteInvoice(invoice.id)}
                          disabled={!!updatingId || bulkProcessing}
                          className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
