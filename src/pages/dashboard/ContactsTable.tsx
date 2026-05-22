import React, { useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { Contact } from '../../types';
import { 
  MessageSquare, 
  CheckCircle2, 
  Mail, 
  ExternalLink,
  Reply
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/TableSkeleton';
import { useTable } from '../../hooks/useTable';

export default function ContactsTable() {
  const {
    data: contacts,
    loading,
    page,
    setPage,
    pagination,
    refetch
  } = useTable<Contact>('/api/admin/contacts');

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: Contact['status']) => {
    setUpdatingId(id);
    try {
      await api.patch(`/api/admin/contacts/${id}/status`, { status });
      toast.success(`Contact status updated to ${status}`);
      await refetch();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update status';
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-brand-red" />
          Contact Messages
        </h2>
        {!loading && pagination.total > 0 && (
          <span className="text-xs text-text-tertiary uppercase tracking-widest">
            {pagination.total} total message{pagination.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No contact messages yet"
          description="Messages from customers will appear here."
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                  <th className="px-6 py-2">Sender</th>
                  <th className="px-6 py-2">Subject / Message</th>
                  <th className="px-6 py-2">Status</th>
                  <th className="px-6 py-2">Date</th>
                  <th className="px-6 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className="card-dark group hover:bg-bg-secondary transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-text-primary">{contact.name}</div>
                      <div className="text-xs text-text-tertiary">{contact.email}</div>
                      {contact.phone && <div className="text-[10px] text-text-tertiary">{contact.phone}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold">{contact.subject}</div>
                      <div className="text-xs text-text-tertiary truncate max-w-[250px]">{contact.message}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                          contact.status === 'NEW' && "bg-brand-red/10 text-brand-red",
                          contact.status === 'READ' && "bg-blue-500/10 text-blue-400",
                          contact.status === 'REPLIED' && "bg-green-500/10 text-green-400",
                          contact.status === 'ARCHIVED' && "bg-bg-secondary text-text-tertiary"
                        )}>
                          {contact.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-text-tertiary">
                        {format(new Date(contact.createdAt), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {contact.status === 'NEW' && (
                          <button
                            onClick={() => updateStatus(contact.id, 'READ')}
                            disabled={!!updatingId}
                            className="p-2 hover:bg-bg-secondary text-text-secondary rounded-lg transition-colors"
                            title="Mark as Read"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors" title="Reply">
                          <Reply className="w-4 h-4" />
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
