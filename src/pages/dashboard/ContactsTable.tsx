import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { Contact } from '../../types';
import { 
  MessageSquare, 
  CheckCircle2, 
  Mail, 
  ExternalLink,
  Reply,
  Filter,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  XCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/TableSkeleton';
import { useTable } from '../../hooks/useTable';
import { useDebounce } from '../../hooks/useDebounce';
import { exportToCSV } from '../../lib/export';

export default function ContactsTable() {
  const { t } = useTranslation();
  const {
    data: contacts,
    loading,
    page,
    setPage,
    pagination,
    refetch,
    filters,
    setFilters,
    sort,
    setSort
  } = useTable<Contact>('/api/admin/contacts');

  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch, setFilters]);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkStatusUpdate = async (status: Contact['status']) => {
    if (!window.confirm(`Update ${selectedIds.length} messages to ${status}?`)) return;
    setUpdatingId('bulk');
    try {
      await Promise.all(selectedIds.map(id => api.patch(`/api/admin/contacts/${id}/status`, { status })));
      toast.success(`Updated ${selectedIds.length} messages`);
      setSelectedIds([]);
      await refetch();
    } catch (error) {
      toast.error('Failed to update some messages');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} messages? This cannot be undone.`)) return;
    setUpdatingId('bulk');
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/api/admin/contacts/${id}`)));
      toast.success(`Deleted ${selectedIds.length} messages`);
      setSelectedIds([]);
      await refetch();
    } catch (error) {
      toast.error('Failed to delete some messages');
    } finally {
      setUpdatingId(null);
    }
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-brand-red" />
          {t('dashboard.admin.sections.contacts.title')}
        </h2>

        <div className="flex flex-wrap items-center gap-4">
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

          <div className="flex items-center gap-2 bg-bg-secondary px-3 py-2 rounded-xl border border-border-primary">
            <Filter className="w-4 h-4 text-text-tertiary" />
            <select 
              value={filters.status || 'all'} 
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-transparent border-none text-xs font-bold uppercase tracking-wider focus:ring-0 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="NEW">New</option>
              <option value="READ">Read</option>
              <option value="REPLIED">Replied</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <button
            onClick={() => exportToCSV(contacts, 'contacts_export')}
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
        <TableSkeleton rows={5} columns={5} />
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={t('dashboard.common.noData')}
          description="Messages from customers will appear here."
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
                  onClick={() => handleBulkStatusUpdate('READ')}
                  className="px-4 py-2 hover:bg-blue-500/10 text-blue-400 text-xs font-bold uppercase rounded-lg transition-colors"
                >
                  Mark Read
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('ARCHIVED')}
                  className="px-4 py-2 hover:bg-bg-secondary text-text-secondary text-xs font-bold uppercase rounded-lg transition-colors"
                >
                  Archive
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
                      checked={selectedIds.length === contacts.length && contacts.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-brand-red rounded bg-bg-secondary border-border-primary"
                    />
                  </th>
                  <th className="px-6 py-2">Sender</th>
                  <th className="px-6 py-2">Subject / Message</th>
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
                {contacts.map((contact) => (
                  <tr key={contact.id} className={cn(
                    "card-dark group hover:bg-bg-secondary transition-colors",
                    selectedIds.includes(contact.id) && "border-brand-red/30 bg-brand-red/5 shadow-lg shadow-brand-red/5"
                  )}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(contact.id)}
                        onChange={() => toggleSelect(contact.id)}
                        className="w-4 h-4 accent-brand-red rounded bg-bg-secondary border-border-primary"
                      />
                    </td>
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
