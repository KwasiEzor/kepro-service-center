import React, { useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { Invoice } from '../../types';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  Trash2,
  Eye,
  Ban,
  Filter,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/TableSkeleton';
import { useTable } from '../../hooks/useTable';
import { exportToCSV } from '../../lib/export';

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

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === invoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(invoices.map(i => i.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkStatusUpdate = async (status: Invoice['status']) => {
    if (!window.confirm(`Update ${selectedIds.length} invoices to ${status}?`)) return;
    setUpdatingId('bulk');
    try {
      await Promise.all(selectedIds.map(id => api.patch(`/api/admin/invoices/${id}/status`, { status })));
      toast.success(`Updated ${selectedIds.length} invoices`);
      setSelectedIds([]);
      await refetch();
    } catch (error) {
      toast.error('Failed to update some invoices');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} invoices? This cannot be undone.`)) return;
    setUpdatingId('bulk');
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/api/admin/invoices/${id}`)));
      toast.success(`Deleted ${selectedIds.length} invoices`);
      setSelectedIds([]);
      await refetch();
    } catch (error) {
      toast.error('Failed to delete some invoices');
    } finally {
      setUpdatingId(null);
    }
  };

  const updateStatus = async (id: string, status: Invoice['status']) => {
    setUpdatingId(id);
    try {
      await api.patch(`/api/admin/invoices/${id}/status`, { status });
      toast.success(`Invoice status updated to ${status}`);
      await refetch();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update status';
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const markPaid = async (id: string) => {
    setUpdatingId(id);
    try {
      await api.patch(`/api/admin/invoices/${id}/paid`, {
        paymentMethod: 'Manual',
        paidAt: new Date().toISOString()
      });
      toast.success('Invoice marked as paid');
      await refetch();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to mark as paid';
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture?')) return;

    setUpdatingId(id);
    try {
      await api.delete(`/api/admin/invoices/${id}`);
      toast.success('Invoice deleted successfully');
      await refetch();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete invoice';
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'DRAFT': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'SENT': return <Send className="w-4 h-4 text-blue-500" />;
      case 'PAID': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'OVERDUE': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'CANCELLED': return <Ban className="w-4 h-4 text-gray-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'DRAFT': return 'text-gray-500';
      case 'SENT': return 'text-blue-500';
      case 'PAID': return 'text-green-500';
      case 'OVERDUE': return 'text-red-500';
      case 'CANCELLED': return 'text-gray-400';
      default: return 'text-text-tertiary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-red" />
          {t('dashboard.admin.sections.invoices.title')}
        </h2>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
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
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <button
            onClick={() => exportToCSV(invoices, 'invoices_export')}
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
        <TableSkeleton rows={5} columns={6} />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t('dashboard.common.noData')}
          description="Invoices will appear here once created."
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
                  onClick={() => handleBulkStatusUpdate('SENT')}
                  className="px-4 py-2 hover:bg-blue-500/10 text-blue-400 text-xs font-bold uppercase rounded-lg transition-colors"
                >
                  Send
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('PAID')}
                  className="px-4 py-2 hover:bg-green-500/10 text-green-400 text-xs font-bold uppercase rounded-lg transition-colors"
                >
                  Mark Paid
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
                      checked={selectedIds.length === invoices.length && invoices.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-brand-red rounded bg-bg-secondary border-border-primary"
                    />
                  </th>
                  <th className="px-6 py-2">Invoice #</th>
                  <th 
                    className="px-6 py-2 cursor-pointer hover:text-text-primary transition-colors"
                    onClick={() => setSort({ 
                      field: 'total', 
                      order: sort?.field === 'total' && sort.order === 'asc' ? 'desc' : 'asc' 
                    })}
                  >
                    <div className="flex items-center gap-1">
                      Amount
                      {sort?.field === 'total' ? (
                        sort.order === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-2 cursor-pointer hover:text-text-primary transition-colors"
                    onClick={() => setSort({ 
                      field: 'dueDate', 
                      order: sort?.field === 'dueDate' && sort.order === 'asc' ? 'desc' : 'asc' 
                    })}
                  >
                    <div className="flex items-center gap-1">
                      Due Date
                      {sort?.field === 'dueDate' ? (
                        sort.order === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>
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
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className={cn(
                    "card-dark group hover:bg-bg-secondary transition-colors",
                    selectedIds.includes(invoice.id) && "border-brand-red/30 bg-brand-red/5 shadow-lg shadow-brand-red/5"
                  )}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(invoice.id)}
                        onChange={() => toggleSelect(invoice.id)}
                        className="w-4 h-4 accent-brand-red rounded bg-bg-secondary border-border-primary"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-text-primary">{invoice.invoiceNumber}</div>
                      <div className="text-xs text-text-tertiary">
                        Créée le {format(new Date(invoice.createdAt), 'dd/MM/yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{invoice.total.toFixed(2)} €</div>
                      <div className="text-xs text-text-tertiary">
                        HT: {invoice.subtotal.toFixed(2)} € + TVA: {invoice.taxAmount.toFixed(2)} €
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}
                      </div>
                      {invoice.paidAt && (
                        <div className="text-xs text-green-500">
                          Payée le {format(new Date(invoice.paidAt), 'dd/MM/yyyy')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invoice.status)}
                        <span className={cn(
                          "text-xs font-bold uppercase tracking-wider",
                          getStatusColor(invoice.status)
                        )}>
                          {invoice.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => window.open(`/invoice/${invoice.id}`, '_blank')}
                          className="p-2 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {invoice.status === 'DRAFT' && (
                          <button
                            onClick={() => updateStatus(invoice.id, 'SENT')}
                            disabled={!!updatingId}
                            className="p-2 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors disabled:opacity-50"
                            title="Envoyer"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}

                        {(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && (
                          <button
                            onClick={() => markPaid(invoice.id)}
                            disabled={!!updatingId}
                            className="p-2 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors disabled:opacity-50"
                            title="Marquer payée"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {invoice.status !== 'PAID' && (
                          <button
                            onClick={() => deleteInvoice(invoice.id)}
                            disabled={!!updatingId}
                            className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
