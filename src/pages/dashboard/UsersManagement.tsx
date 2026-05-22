import React, { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { User } from '../../types';
import {
  Users,
  Search,
  Shield,
  User as UserIcon,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/TableSkeleton';
import { useTable } from '../../hooks/useTable';
import { exportToCSV } from '../../lib/export';

export default function UsersManagement() {
  const { t } = useTranslation();
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

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map(u => u.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkRoleUpdate = async (role: User['role']) => {
    if (!window.confirm(`Update ${selectedIds.length} users to ${role}?`)) return;
    setUpdatingId('bulk');
    try {
      await Promise.all(selectedIds.map(id => api.patch(`/api/admin/users/${id}`, { role })));
      toast.success(`Updated ${selectedIds.length} users to ${role}`);
      setSelectedIds([]);
      await refetch();
    } catch (error) {
      toast.error('Failed to update some users');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} users? This cannot be undone.`)) return;
    setUpdatingId('bulk');
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/api/admin/users/${id}`)));
      toast.success(`Deleted ${selectedIds.length} users`);
      setSelectedIds([]);
      await refetch();
    } catch (error) {
      toast.error('Failed to delete some users');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleRole = async (user: User) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setUpdatingId(user.id);
    try {
      await api.patch(`/api/admin/users/${user.id}`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      await refetch();
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to update user role';
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteUser = async (id: string, userEmail: string) => {
    if (!window.confirm(`Delete user ${userEmail}? This action cannot be undone.`)) {
      return;
    }

    setUpdatingId(id);
    try {
      await api.delete(`/api/admin/users/${id}`);
      toast.success('User deleted successfully');
      await refetch();
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to delete user';
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-red" />
            {t('dashboard.admin.sections.users.title')}
          </h2>
          <p className="text-text-tertiary text-sm">{t('dashboard.admin.sections.users.desc')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="bg-bg-secondary border border-border-primary rounded-xl pl-10 pr-4 py-2 text-xs font-bold focus:outline-none focus:border-brand-red/50 transition-colors w-full md:w-64"
            />
          </div>

          <div className="flex items-center gap-2 bg-bg-secondary px-3 py-2 rounded-xl border border-border-primary">
            <Filter className="w-4 h-4 text-text-tertiary" />
            <select 
              value={filters.role || 'all'} 
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="bg-transparent border-none text-xs font-bold uppercase tracking-wider focus:ring-0 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
          </div>

          <button
            onClick={() => exportToCSV(users, 'users_export')}
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
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t('dashboard.common.noData')}
          description={
            filters.search
              ? `No users match "${filters.search}". Try a different search term.`
              : 'Registered users will appear here.'
          }
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
                  onClick={() => handleBulkRoleUpdate('ADMIN')}
                  className="px-4 py-2 hover:bg-blue-500/10 text-blue-400 text-xs font-bold uppercase rounded-lg transition-colors"
                >
                  Make Admin
                </button>
                <button
                  onClick={() => handleBulkRoleUpdate('USER')}
                  className="px-4 py-2 hover:bg-bg-secondary text-text-secondary text-xs font-bold uppercase rounded-lg transition-colors"
                >
                  Make User
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
                      checked={selectedIds.length === users.length && users.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-brand-red rounded bg-bg-secondary border-border-primary"
                    />
                  </th>
                  <th className="px-6 py-2">User</th>
                  <th 
                    className="px-6 py-2 cursor-pointer hover:text-text-primary transition-colors"
                    onClick={() => setSort({ 
                      field: 'email', 
                      order: sort?.field === 'email' && sort.order === 'asc' ? 'desc' : 'asc' 
                    })}
                  >
                    <div className="flex items-center gap-1">
                      Contact / Email
                      {sort?.field === 'email' ? (
                        sort.order === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-2 cursor-pointer hover:text-text-primary transition-colors"
                    onClick={() => setSort({ 
                      field: 'role', 
                      order: sort?.field === 'role' && sort.order === 'asc' ? 'desc' : 'asc' 
                    })}
                  >
                    <div className="flex items-center gap-1">
                      Role
                      {sort?.field === 'role' ? (
                        sort.order === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>
                  <th className="px-6 py-2">Activity</th>
                  <th className="px-6 py-2 text-right">{t('dashboard.common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={cn(
                    "card-dark group hover:bg-bg-secondary transition-colors",
                    selectedIds.includes(u.id) && "border-brand-red/30 bg-brand-red/5 shadow-lg shadow-brand-red/5"
                  )}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(u.id)}
                        onChange={() => toggleSelect(u.id)}
                        className="w-4 h-4 accent-brand-red rounded bg-bg-secondary border-border-primary"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                          u.role === 'ADMIN' ? "bg-brand-red/20 text-brand-red" : "bg-bg-secondary text-text-secondary"
                        )}>
                          {u.firstName ? u.firstName[0].toUpperCase() : u.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-text-primary">
                            {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'Anonymous'}
                          </div>
                          <div className="text-xs text-text-tertiary flex items-center gap-1">
                            Joined {format(new Date(u.createdAt), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-text-secondary flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {u.email}
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {u.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                        u.role === 'ADMIN' ? "bg-brand-red/20 text-brand-red" : "bg-bg-secondary text-text-secondary"
                      )}>
                        {u.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                        {u.role}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-text-tertiary">
                        <div>{u._count?.quotes || 0} Quote Requests</div>
                        <div>{u._count?.contacts || 0} Contact Messages</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleRole(u)}
                          disabled={!!updatingId}
                          className={cn(
                            "p-2 rounded-lg transition-colors disabled:opacity-50",
                            u.role === 'ADMIN'
                              ? "hover:bg-bg-secondary text-text-tertiary"
                              : "hover:bg-brand-red/20 text-brand-red"
                          )}
                          title={u.role === 'ADMIN' ? "Remove Admin Privileges" : "Make Administrator"}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(u.id, u.email)}
                          disabled={!!updatingId}
                          className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors disabled:opacity-50"
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
