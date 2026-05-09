import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import { User, ApiResponse } from '../../types';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function UserProfile() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await api.patch<ApiResponse<User>>('/api/user/profile', formData);
      if (response.data.data) {
        // Update local auth context
        await updateProfile(response.data.data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-brand-red/20 text-brand-red clip-angular-sm flex items-center justify-center">
          <UserIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
          <p className="text-white/40 text-sm">Update your personal information and contact details</p>
        </div>
      </div>

      <div className="card-dark p-8 md:p-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 clip-angular-sm py-4 px-4 text-white focus:border-brand-red transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 clip-angular-sm py-4 px-4 text-white focus:border-brand-red transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full bg-white/5 border border-white/5 clip-angular-sm py-4 px-4 text-white/40 cursor-not-allowed"
              />
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
            </div>
            <p className="text-[10px] text-white/20 italic ml-2">Email cannot be changed for security reasons</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+33 6 00 00 00 00"
                className="w-full bg-white/5 border border-white/10 clip-angular-sm py-4 px-4 text-white focus:border-brand-red transition-all"
              />
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-500 text-sm">
              <CheckCircle2 className="w-5 h-5" />
              Profile updated successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-brand-red font-black text-xl clip-angular-sm flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save className="w-6 h-6" />}
            SAVE CHANGES
          </button>
        </form>
      </div>
    </div>
  );
}
