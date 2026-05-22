import React, { useState } from 'react';
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
  Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/TableSkeleton';
import { useTable } from '../../hooks/useTable';

export default function QuotesTable() {
  const { t } = useTranslation();
  const {
    data: quotes,
    loading,
    page,
    setPage,
    pagination,
    refetch
  } = useTable<Quote>('/api/admin/quotes');

  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-red" />
          {t('dashboard.admin.sections.quotes.title')}
        </h2>
        {!loading && pagination.total > 0 && (
          <span className="text-xs text-text-tertiary uppercase tracking-widest">
            {pagination.total} {t('dashboard.common.total')}
          </span>
        )}
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                  <th className="px-6 py-2">Customer / Vehicle</th>
                  <th className="px-6 py-2">Service</th>
                  <th className="px-6 py-2">{t('dashboard.common.status')}</th>
                  <th className="px-6 py-2">{t('dashboard.common.date')}</th>
                  <th className="px-6 py-2 text-right">{t('dashboard.common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote.id} className="card-dark group hover:bg-bg-secondary transition-colors">
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
