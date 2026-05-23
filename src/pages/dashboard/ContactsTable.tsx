import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { Contact, ContactStatus } from '../../types';
import {
  MessageSquare,
  Mail,
  Reply,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/TableSkeleton';
import { useTable } from '../../hooks/useTable';
import { useDebounce } from '../../hooks/useDebounce';
import { useBulkActions } from '../../hooks/useBulkActions';
import { exportToCSV } from '../../lib/export';
import { TableToolbar } from '../../components/dashboard/TableToolbar';
import { BulkActionsBar } from '../../components/dashboard/BulkActionsBar';
import { TableHeader } from '../../components/dashboard/TableHeader';

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

  const {
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    handleBulkAction,
    isProcessing: bulkProcessing
  } = useBulkActions('/api/admin/contacts', contacts, { onSuccess: refetch });

  const updateStatus = async (id: string, status: Contact['status']) => {
    setUpdatingId(id);
    try {
      await api.patch(`/api/admin/contacts/${id}/status`, { status });
      toast.success('Message marked as read');
      await refetch();
    } catch (error: any) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusIcon = (status: Contact['status']) => {
    switch (status) {
      case 'NEW': return <Mail className="w-4 h-4 text-brand-red" />;
      case ContactStatus.READ: return <Clock className="w-4 h-4 text-blue-500" />;
      case 'REPLIED': return <Reply className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <TableToolbar 
        title={t('dashboard.admin.sections.contacts.title')}
        icon={MessageSquare}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        statusValue={filters.status || 'all'}
        onStatusChange={(status) => setFilters({ ...filters, status })}
        statusOptions={[
          { label: 'All Status', value: 'all' },
          { label: 'New', value: 'NEW' },
          { label: 'Read', value: ContactStatus.READ },
          { label: 'Replied', value: 'REPLIED' },
          { label: 'Archived', value: 'ARCHIVED' },
        ]}
        onExport={() => exportToCSV(contacts, 'contacts_export')}
        totalItems={pagination.total}
        loading={loading}
      />

      {loading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={t('dashboard.common.noData')}
          description="Customer inquiries will appear here."
        />
      ) : (
        <>
          <BulkActionsBar 
            selectedCount={selectedIds.length}
            onClear={clearSelection}
            actions={[
              { label: 'Mark Read', onClick: () => handleBulkAction('patch', { status: ContactStatus.READ }, undefined, '/status'), variant: 'blue' },
              { label: 'Archive', onClick: () => handleBulkAction('patch', { status: 'ARCHIVED' }, undefined, '/status'), variant: 'default' },
              { label: 'Delete', onClick: () => handleBulkAction('delete'), variant: 'danger' },
            ]}
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <TableHeader 
                showCheckbox
                checkboxChecked={selectedIds.length === contacts.length && contacts.length > 0}
                onCheckboxChange={toggleSelectAll}
                currentSort={sort as any}
                onSort={(field) => setSort({ 
                  field, 
                  order: sort?.field === field && sort.order === 'asc' ? 'desc' : 'asc' 
                })}
                columns={[
                  { label: 'Sender' },
                  { label: 'Subject' },
                  { label: t('dashboard.common.status'), field: 'status', sortable: true },
                  { label: t('dashboard.common.date'), field: 'createdAt', sortable: true },
                  { label: t('dashboard.common.actions'), className: 'text-right' }
                ]}
              />
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
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm truncate max-w-[200px]">{contact.subject}</div>
                      <div className="text-xs text-text-tertiary truncate max-w-[200px]">{contact.message}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(contact.status)}
                        <span className={cn(
                          "text-xs font-bold uppercase tracking-wider",
                          contact.status === 'NEW' && "text-brand-red",
                          contact.status === ContactStatus.READ && "text-blue-500",
                          contact.status === 'REPLIED' && "text-green-500",
                          contact.status === 'ARCHIVED' && "text-text-tertiary"
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
                            onClick={() => updateStatus(contact.id, ContactStatus.READ)}
                            disabled={!!updatingId || bulkProcessing}
                            className="p-2 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors disabled:opacity-50"
                            title="Mark as Read"
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
