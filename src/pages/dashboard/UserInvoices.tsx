import React from 'react';
import { Invoice } from '../../types';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  Eye,
  Ban
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/TableSkeleton';
import { useTable } from '../../hooks/useTable';

export default function UserInvoices() {
  const {
    data: invoices,
    loading,
    page,
    setPage,
    pagination
  } = useTable<Invoice>('/api/user/invoices');

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'DRAFT': return 'text-gray-500 bg-gray-500/10';
      case 'SENT': return 'text-blue-500 bg-blue-500/10';
      case 'PAID': return 'text-green-500 bg-green-500/10';
      case 'OVERDUE': return 'text-red-500 bg-red-500/10';
      case 'CANCELLED': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-text-tertiary bg-bg-secondary';
    }
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'DRAFT': return <Clock className="w-4 h-4" />;
      case 'SENT': return <Clock className="w-4 h-4" />;
      case 'PAID': return <CheckCircle2 className="w-4 h-4" />;
      case 'OVERDUE': return <XCircle className="w-4 h-4" />;
      case 'CANCELLED': return <Ban className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-red" />
          Mes Factures
        </h2>
        {!loading && pagination.total > 0 && (
          <span className="text-xs text-text-tertiary uppercase tracking-widest">
            {pagination.total} total facture{pagination.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          <TableSkeleton rows={3} columns={1} />
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Vous n'avez aucune facture"
          description="Vos factures apparaîtront ici une fois qu'elles seront créées par notre équipe."
        />
      ) : (
        <>
          <div className="grid gap-6">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="card-dark p-6 group hover:bg-bg-secondary transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1",
                        getStatusColor(invoice.status)
                      )}>
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        N° {invoice.invoiceNumber}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-text-primary">
                      Facture {invoice.invoiceNumber}
                    </h3>
                    {invoice.items && invoice.items.length > 0 && (
                      <p className="text-sm text-text-secondary">
                        {invoice.items.length} article{invoice.items.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="text-xs text-text-tertiary uppercase tracking-widest mb-1">Date</div>
                      <div className="text-sm font-bold text-text-secondary">
                        {format(new Date(invoice.createdAt), 'dd/MM/yyyy')}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-text-tertiary uppercase tracking-widest mb-1">Échéance</div>
                      <div className="text-sm font-bold text-text-secondary">
                        {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-text-tertiary uppercase tracking-widest mb-1">Montant</div>
                      <div className="text-lg font-black text-brand-red">
                        {invoice.total.toFixed(2)} €
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(`/invoice/${invoice.id}`, '_blank')}
                        className="p-3 bg-bg-secondary hover:bg-brand-red/20 text-brand-red rounded-xl transition-colors"
                        title="Voir"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => window.open(`/invoice/${invoice.id}/download`, '_blank')}
                        className="p-3 bg-bg-secondary hover:bg-brand-red/20 text-brand-red rounded-xl transition-colors"
                        title="Télécharger"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {invoice.paidAt && (
                  <div className="mt-6 p-4 bg-green-500/10 border-l-4 border-green-500 rounded-r-xl">
                    <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-2">Payée</p>
                    <p className="text-sm text-text-secondary">
                      Payée le {format(new Date(invoice.paidAt), 'dd/MM/yyyy')}
                      {invoice.paymentMethod && ` via ${invoice.paymentMethod}`}
                    </p>
                  </div>
                )}

                {invoice.notes && (
                  <div className="mt-4 p-4 bg-bg-secondary rounded-xl">
                    <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-2">Notes:</p>
                    <p className="text-sm text-text-secondary italic">"{invoice.notes}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
