import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Quote } from '../../types';
import { 
  FileText, 
  ChevronRight,
  Search
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/TableSkeleton';
import { useTable } from '../../hooks/useTable';
import { useDebounce } from '../../hooks/useDebounce';

export default function UserQuotes() {
  const {
    data: quotes,
    loading,
    page,
    setPage,
    pagination,
    filters,
    setFilters
  } = useTable<Quote>('/api/user/quotes');

  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch, setFilters]);

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-500 bg-yellow-500/10';
      case 'REVIEWING': return 'text-blue-500 bg-blue-500/10';
      case 'APPROVED': return 'text-green-500 bg-green-500/10';
      case 'REJECTED': return 'text-red-500 bg-red-500/10';
      default: return 'text-text-tertiary bg-bg-secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-red" />
          My Service Quotes
        </h2>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search my quotes..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-bg-secondary border border-border-primary rounded-xl pl-10 pr-4 py-2 text-xs font-bold focus:outline-none focus:border-brand-red/50 transition-colors w-full md:w-64"
            />
          </div>

          {!loading && pagination.total > 0 && (
            <span className="text-xs text-text-tertiary uppercase tracking-widest whitespace-nowrap">
              {pagination.total} total request{pagination.total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <TableSkeleton rows={3} columns={1} />
        </div>
      ) : quotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="You haven't requested any quotes yet"
          description="Your quote requests will appear here once you submit them."
          action={
            <button 
              onClick={() => window.location.href = '/quote'}
              className="mt-6 px-8 py-3 bg-brand-red hover:bg-brand-red/80 text-white font-bold transition-all rounded-xl"
            >
              Get a Quote Now
            </button>
          }
        />
      ) : (
        <>
          <div className="grid gap-6">
            {quotes.map((quote) => (
              <div key={quote.id} className="card-dark p-6 group hover:bg-bg-secondary transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                        getStatusColor(quote.status)
                      )}>
                        {quote.status}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        ID: {quote.id.toUpperCase().slice(-6)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-text-primary">
                      {quote.brand} {quote.model} ({quote.year})
                    </h3>
                    <p className="text-sm text-text-secondary uppercase tracking-wider">{quote.serviceType}</p>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                       <div className="text-xs text-text-tertiary uppercase tracking-widest mb-1">Date Submitted</div>
                       <div className="text-sm font-bold text-text-secondary">
                         {format(new Date(quote.createdAt), 'MMM d, yyyy')}
                       </div>
                    </div>
                    
                    {quote.estimatedPrice && (
                      <div className="text-right">
                        <div className="text-xs text-text-tertiary uppercase tracking-widest mb-1">Estimated Price</div>
                        <div className="text-lg font-black text-brand-red">€{quote.estimatedPrice}</div>
                      </div>
                    )}

                    <button className="p-3 bg-bg-secondary hover:bg-bg-secondary rounded-xl transition-colors">
                      <ChevronRight className="w-5 h-5 text-text-tertiary" />
                    </button>
                  </div>
                </div>
                
                {quote.adminNotes && (
                  <div className="mt-6 p-4 bg-bg-secondary border-l-4 border-brand-red rounded-r-xl">
                    <p className="text-xs font-bold text-brand-red uppercase tracking-widest mb-2">Technician Note:</p>
                    <p className="text-sm text-text-secondary italic">"{quote.adminNotes}"</p>
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
