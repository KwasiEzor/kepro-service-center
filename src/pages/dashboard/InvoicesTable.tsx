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
  Ban
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/TableSkeleton';
import { useTable } from '../../hooks/useTable';

export default function InvoicesTable() {
  const {
    data: invoices,
    loading,
    page,
    setPage,
    pagination,
    refetch
  } = useTable<Invoice>('/api/admin/invoices');

  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-red" />
          Factures
        </h2>
        {!loading && pagination.total > 0 && (
          <span className="text-xs text-text-tertiary uppercase tracking-widest">
            {pagination.total} total facture{pagination.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No invoices yet"
          description="Invoices will appear here once they are created."
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                  <th className="px-6 py-2">Numéro</th>
                  <th className="px-6 py-2">Montant</th>
                  <th className="px-6 py-2">Échéance</th>
                  <th className="px-6 py-2">Statut</th>
                  <th className="px-6 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="card-dark group hover:bg-bg-secondary transition-colors">
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
