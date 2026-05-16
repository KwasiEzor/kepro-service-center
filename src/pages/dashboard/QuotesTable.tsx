import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Quote, ApiResponse } from '../../types';
import { 
  FileText, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ExternalLink
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

export default function QuotesTable() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchQuotes = async () => {
    try {
      const response = await api.get<ApiResponse<{ data: Quote[], pagination: any }>>('/api/admin/quotes');
      setQuotes(response.data.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const updateStatus = async (id: string, status: Quote['status']) => {
    setUpdatingId(id);
    try {
      await api.patch(`/api/admin/quotes/${id}/status`, { status });
      await fetchQuotes();
    } catch (error) {
      console.error('Failed to update status:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-red" />
          Quote Requests
        </h2>
        <span className="text-xs text-white/40 uppercase tracking-widest">
          {quotes.length} total requests
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-4">
          <thead>
            <tr className="text-xs font-bold text-white/40 uppercase tracking-widest">
              <th className="px-6 py-2">Customer / Vehicle</th>
              <th className="px-6 py-2">Service</th>
              <th className="px-6 py-2">Status</th>
              <th className="px-6 py-2">Date</th>
              <th className="px-6 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <tr key={quote.id} className="card-dark group hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white">{quote.name}</div>
                  <div className="text-xs text-white/50">{quote.brand} {quote.model} ({quote.year})</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">{quote.serviceType}</div>
                  <div className="text-xs text-white/40 truncate max-w-[200px]">{quote.description}</div>
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
                  <div className="text-xs text-white/50">
                    {format(new Date(quote.createdAt), 'MMM d, yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {quote.status === 'PENDING' && (
                      <button
                        onClick={() => updateStatus(quote.id, 'REVIEWING')}
                        disabled={!!updatingId}
                        className="p-2 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors"
                        title="Mark as Reviewing"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                    {quote.status !== 'APPROVED' && (
                      <button
                        onClick={() => updateStatus(quote.id, 'APPROVED')}
                        disabled={!!updatingId}
                        className="p-2 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-2 hover:bg-white/10 text-white/60 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {quotes.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
            <p className="text-white/40 italic">No quote requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
