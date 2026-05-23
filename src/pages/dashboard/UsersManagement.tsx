import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { User, UserRole } from '../../types';
import {
  Users,
  Shield,
  ShieldAlert,
  Trash2,
  Mail,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/TableSkeleton';
import { useTable } from '../../hooks/useTable';
import { useDebounce } from '../../hooks/useDebounce';
import { useBulkActions } from '../../hooks/useBulkActions';
import { TableToolbar } from '../../components/dashboard/TableToolbar';
import { BulkActionsBar } from '../../components/dashboard/BulkActionsBar';
import { TableHeader } from '../../components/dashboard/TableHeader';
import { useAuth } from '../../hooks/useAuth';

export default function UsersManagement() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const {
    data: users,
    loading,
    page,
    setPage,
    pagination,
    refetch,
    filters,
    setFilters,
    sort,
    setSort
  } = useTable<User>('/api/admin/users');

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
  } = useBulkActions('/api/admin/users', users, { onSuccess: refetch });

  const toggleRole = async (id: string, currentRole: UserRole) => {
    if (id === currentUser?.id) {
      toast.error('You cannot change your own role');
      return;
    }

    setUpdatingId(id);
    const newRole = currentRole === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
    try {
      await api.patch(`/api/admin/users/${id}`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      await refetch();
    } catch (error: any) {
      toast.error('Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? All their data will be lost.')) return;

    setUpdatingId(id);
    try {
      await api.delete(`/api/admin/users/${id}`);
      toast.success('User deleted successfully');
      await refetch();
    } catch (error: any) {
      toast.error('Failed to delete user');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <TableToolbar 
        title={t('dashboard.admin.sections.users.title')}
        icon={Users}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        statusValue={filters.role || 'all'}
        onStatusChange={(role) => setFilters({ ...filters, role })}
        statusOptions={[
          { label: 'All Roles', value: 'all' },
          { label: 'Admin', value: 'ADMIN' },
          { label: 'User', value: 'USER' },
        ]}
        totalItems={pagination.total}
        loading={loading}
      />

      {loading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t('dashboard.common.noData')}
          description="No users found matching your criteria."
        />
      ) : (
        <>
          <BulkActionsBar 
            selectedCount={selectedIds.length}
            onClear={clearSelection}
            actions={[
              { label: 'Make Admin', onClick: () => handleBulkAction('patch', { role: 'ADMIN' }), variant: 'blue' },
              { label: 'Make User', onClick: () => handleBulkAction('patch', { role: 'USER' }), variant: 'default' },
              { label: 'Delete', onClick: () => handleBulkAction('delete'), variant: 'danger' },
            ]}
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <TableHeader 
                showCheckbox
                checkboxChecked={selectedIds.length === users.length && users.length > 0}
                onCheckboxChange={toggleSelectAll}
                currentSort={sort as any}
                onSort={(field) => setSort({ 
                  field, 
                  order: sort?.field === field && sort.order === 'asc' ? 'desc' : 'asc' 
                })}
                columns={[
                  { label: 'User Details' },
                  { label: 'Role', field: 'role', sortable: true },
                  { label: 'Activity' },
                  { label: 'Joined', field: 'createdAt', sortable: true },
                  { label: t('dashboard.common.actions'), className: 'text-right' }
                ]}
              />
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={cn(
                    "card-dark group hover:bg-bg-secondary transition-colors",
                    selectedIds.includes(user.id) && "border-brand-red/30 bg-brand-red/5 shadow-lg shadow-brand-red/5"
                  )}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(user.id)}
                          onChange={() => toggleSelect(user.id)}
                          className="w-4 h-4 accent-brand-red rounded bg-bg-secondary border-border-primary"
                        />
                        <div>
                          <div className="font-bold text-text-primary">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-text-tertiary flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        user.role === UserRole.ADMIN ? "bg-brand-red/10 text-brand-red" : "bg-bg-secondary text-text-tertiary"
                      )}>
                        {user.role === UserRole.ADMIN ? <Shield className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                        {user.role}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-xs">
                         <div className="text-text-tertiary">
                            <span className="font-bold text-text-secondary">{user._count?.quotes || 0}</span> Quotes
                         </div>
                         <div className="text-text-tertiary">
                            <span className="font-bold text-text-secondary">{user._count?.contacts || 0}</span> Msgs
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-text-tertiary flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleRole(user.id, user.role)}
                          disabled={!!updatingId || bulkProcessing || user.id === currentUser?.id}
                          className="p-2 hover:bg-bg-tertiary rounded-lg text-text-secondary transition-colors disabled:opacity-30"
                          title={user.role === UserRole.ADMIN ? "Demote to User" : "Make Admin"}
                        >
                          {user.role === UserRole.ADMIN ? <ShieldAlert className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={!!updatingId || bulkProcessing || user.id === currentUser?.id}
                          className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors disabled:opacity-30"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
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
