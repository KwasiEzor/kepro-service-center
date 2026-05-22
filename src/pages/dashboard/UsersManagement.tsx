import React, { useState } from 'react';
import { toast } from 'sonner';
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
  Calendar
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/TableSkeleton';
import { useTable } from '../../hooks/useTable';

export default function UsersManagement() {
  const {
    data: users,
    loading,
    page,
    setPage,
    pagination,
    refetch
  } = useTable<User>('/api/admin/users');

  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const filteredUsers = users.filter(user => {
    const searchStr = `${user.email} ${user.firstName} ${user.lastName}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-red" />
            User Management
          </h2>
          <p className="text-text-tertiary text-sm">Manage user roles and permissions</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-bg-secondary border border-border-primary rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-red/50 transition-colors w-full md:w-64"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchTerm ? 'No users found' : 'No users yet'}
          description={
            searchTerm
              ? `No users match "${searchTerm}". Try a different search term.`
              : 'Registered users will appear here.'
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                  <th className="px-6 py-2">User</th>
                  <th className="px-6 py-2">Contact</th>
                  <th className="px-6 py-2">Role</th>
                  <th className="px-6 py-2">Activity</th>
                  <th className="px-6 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="card-dark group hover:bg-bg-secondary transition-colors">
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
                            <Mail className="w-3 h-3" />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-text-secondary flex flex-col gap-1">
                        {u.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {u.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Joined {format(new Date(u.createdAt), 'MMM d, yyyy')}
                        </div>
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

          {!searchTerm && pagination.pages > 1 && (
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
