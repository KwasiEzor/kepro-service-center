import React, { useState, useEffect } from 'react';
import { Contact } from '../../types';
import { 
  MessageSquare, 
  ChevronRight,
  Reply,
  Search
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/TableSkeleton';
import { useTable } from '../../hooks/useTable';
import { useDebounce } from '../../hooks/useDebounce';

export default function UserContacts() {
  const {
    data: contacts,
    loading,
    page,
    setPage,
    pagination,
    filters,
    setFilters
  } = useTable<Contact>('/api/user/contacts');

  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch, setFilters]);

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'NEW': return 'text-yellow-500 bg-yellow-500/10';
      case 'READ': return 'text-blue-500 bg-blue-500/10';
      case 'REPLIED': return 'text-green-500 bg-green-500/10';
      case 'ARCHIVED': return 'text-text-tertiary bg-bg-secondary';
      default: return 'text-text-tertiary bg-bg-secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-brand-red" />
          My Message History
        </h2>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-bg-secondary border border-border-primary rounded-xl pl-10 pr-4 py-2 text-xs font-bold focus:outline-none focus:border-brand-red/50 transition-colors w-full md:w-64"
            />
          </div>

          {!loading && pagination.total > 0 && (
            <span className="text-xs text-text-tertiary uppercase tracking-widest whitespace-nowrap">
              {pagination.total} total message{pagination.total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <TableSkeleton rows={3} columns={1} />
        </div>
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No messages found in your history"
          description="Your messages to our support team will appear here."
          action={
            <button 
              onClick={() => window.location.href = '/contact'}
              className="mt-6 px-8 py-3 bg-brand-red hover:bg-brand-red/80 text-white font-bold transition-all rounded-xl"
            >
              Contact Support
            </button>
          }
        />
      ) : (
        <>
          <div className="grid gap-6">
            {contacts.map((contact) => (
              <div key={contact.id} className="card-dark p-6 group hover:bg-bg-secondary transition-all">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                        getStatusColor(contact.status)
                      )}>
                        {contact.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {format(new Date(contact.createdAt), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-text-primary mb-1">
                        {contact.subject || 'General Inquiry'}
                      </h3>
                      <div className="p-3 bg-bg-primary/30 rounded-lg border border-border-secondary/50 italic text-text-secondary text-sm">
                        "{contact.message}"
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button className="p-2 bg-bg-secondary hover:bg-bg-tertiary rounded-lg transition-colors">
                      <ChevronRight className="w-5 h-5 text-text-tertiary" />
                    </button>
                  </div>
                </div>
                
                {contact.adminReply && (
                  <div className="mt-6 p-5 bg-brand-red/5 border-l-4 border-brand-red rounded-r-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Reply className="w-4 h-4 text-brand-red" />
                      <span className="text-xs font-black text-brand-red uppercase tracking-widest">
                        Response from Support
                      </span>
                    </div>
                    <p className="text-sm text-text-primary leading-relaxed">
                      {contact.adminReply}
                    </p>
                    {contact.updatedAt && (
                      <p className="mt-2 text-[10px] text-text-tertiary uppercase tracking-tighter">
                        Replied on {format(new Date(contact.updatedAt), 'MMM d, yyyy')}
                      </p>
                    )}
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
