import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Quote, ApiResponse } from '../../types';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

export default function UserQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await api.get<ApiResponse<Quote[]>>('/api/user/quotes');
        setQuotes(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch quotes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-500 bg-yellow-500/10';
      case 'REVIEWING': return 'text-blue-500 bg-blue-500/10';
      case 'APPROVED': return 'text-green-500 bg-green-500/10';
      case 'REJECTED': return 'text-red-500 bg-red-500/10';
      default: return 'text-white/40 bg-white/5';
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
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-red" />
          My Service Quotes
        </h2>
      </div>

      <div className="grid gap-6">
        {quotes.map((quote) => (
          <div key={quote.id} className="card-dark p-6 group hover:bg-white/5 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                    getStatusColor(quote.status)
                  )}>
                    {quote.status}
                  </span>
                  <span className="text-xs text-white/30">
                    ID: {quote.id.toUpperCase().slice(-6)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {quote.brand} {quote.model} ({quote.year})
                </h3>
                <p className="text-sm text-white/60 uppercase tracking-wider">{quote.serviceType}</p>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                   <div className="text-xs text-white/30 uppercase tracking-widest mb-1">Date Submitted</div>
                   <div className="text-sm font-bold text-white/80">
                     {format(new Date(quote.createdAt), 'MMM d, yyyy')}
                   </div>
                </div>
                
                {quote.estimatedPrice && (
                  <div className="text-right">
                    <div className="text-xs text-white/30 uppercase tracking-widest mb-1">Estimated Price</div>
                    <div className="text-lg font-black text-brand-red">€{quote.estimatedPrice}</div>
                  </div>
                )}

                <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </button>
              </div>
            </div>
            
            {quote.adminNotes && (
              <div className="mt-6 p-4 bg-white/5 border-l-4 border-brand-red rounded-r-xl">
                <p className="text-xs font-bold text-brand-red uppercase tracking-widest mb-2">Technician Note:</p>
                <p className="text-sm text-white/70 italic">"{quote.adminNotes}"</p>
              </div>
            )}
          </div>
        ))}

        {quotes.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
            <FileText className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 italic text-lg">You haven't requested any quotes yet.</p>
            <button 
              onClick={() => window.location.href = '/quote'}
              className="mt-6 px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold clip-angular-sm transition-all"
            >
              Get a Quote Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
