import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { User, ApiResponse } from '../../types';
import { 
  Users, 
  Search, 
  Shield, 
  User as UserIcon, 
  Trash2, 
  Loader2,
  Mail,
  Phone,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setError(null);
      const response = await api.get<ApiResponse<{ data: User[], pagination: any }>>('/api/admin/users');
      setUsers(response.data.data?.data || []);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (user: User) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setUpdatingId(user.id);
    try {
      await api.patch(`/api/admin/users/${user.id}`, { role: newRole });
      await fetchUsers();
    } catch (err: any) {
      console.error('Failed to update role:', err);
      alert(err.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setUpdatingId(id);
    try {
      await api.delete(`/api/admin/users/${id}`);
      await fetchUsers();
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert(err.message || 'Failed to delete user');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchStr = `${user.email} ${user.firstName} ${user.lastName}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-red" />
            User Management
          </h2>
          <p className="text-white/40 text-sm">Manage user roles and permissions</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-red/50 transition-colors w-full md:w-64"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-4">
          <thead>
            <tr className="text-xs font-bold text-white/40 uppercase tracking-widest">
              <th className="px-6 py-2">User</th>
              <th className="px-6 py-2">Contact</th>
              <th className="px-6 py-2">Role</th>
              <th className="px-6 py-2">Activity</th>
              <th className="px-6 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="card-dark group hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                      u.role === 'ADMIN' ? "bg-brand-red/20 text-brand-red" : "bg-white/10 text-white/60"
                    )}>
                      {u.firstName ? u.firstName[0].toUpperCase() : u.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-white">
                        {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'Anonymous'}
                      </div>
                      <div className="text-xs text-white/50 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {u.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-white/60 flex flex-col gap-1">
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
                    u.role === 'ADMIN' ? "bg-brand-red/20 text-brand-red" : "bg-white/10 text-white/60"
                  )}>
                    {u.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                    {u.role}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-white/40">
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
                        "p-2 rounded-lg transition-colors",
                        u.role === 'ADMIN' 
                          ? "hover:bg-white/10 text-white/40" 
                          : "hover:bg-brand-red/20 text-brand-red"
                      )}
                      title={u.role === 'ADMIN' ? "Remove Admin Privileges" : "Make Administrator"}
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteUser(u.id)}
                      disabled={!!updatingId}
                      className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
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
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
            <p className="text-white/40 italic">No users found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
