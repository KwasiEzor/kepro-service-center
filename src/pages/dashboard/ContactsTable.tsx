import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Contact, ApiResponse } from '../../types';
import { 
  MessageSquare, 
  CheckCircle2, 
  Mail, 
  Loader2,
  ExternalLink,
  Reply
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

export default function ContactsTable() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      const response = await api.get<ApiResponse<{ data: Contact[], pagination: any }>>('/api/admin/contacts');
      setContacts(response.data.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const updateStatus = async (id: string, status: Contact['status']) => {
    setUpdatingId(id);
    try {
      await api.patch(`/api/admin/contacts/${id}/status`, { status });
      await fetchContacts();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-brand-red" />
          Contact Messages
        </h2>
        <span className="text-xs text-white/40 uppercase tracking-widest">
          {contacts.length} total messages
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-4">
          <thead>
            <tr className="text-xs font-bold text-white/40 uppercase tracking-widest">
              <th className="px-6 py-2">Sender</th>
              <th className="px-6 py-2">Subject / Message</th>
              <th className="px-6 py-2">Status</th>
              <th className="px-6 py-2">Date</th>
              <th className="px-6 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="card-dark group hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white">{contact.name}</div>
                  <div className="text-xs text-white/50">{contact.email}</div>
                  {contact.phone && <div className="text-[10px] text-white/30">{contact.phone}</div>}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold">{contact.subject}</div>
                  <div className="text-xs text-white/40 truncate max-w-[250px]">{contact.message}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                      contact.status === 'NEW' && "bg-brand-red/10 text-brand-red",
                      contact.status === 'READ' && "bg-blue-500/10 text-blue-400",
                      contact.status === 'REPLIED' && "bg-green-500/10 text-green-400",
                      contact.status === 'ARCHIVED' && "bg-white/5 text-white/30"
                    )}>
                      {contact.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-white/50">
                    {format(new Date(contact.createdAt), 'MMM d, yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {contact.status === 'NEW' && (
                      <button
                        onClick={() => updateStatus(contact.id, 'READ')}
                        disabled={!!updatingId}
                        className="p-2 hover:bg-white/10 text-white/60 rounded-lg transition-colors"
                        title="Mark as Read"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-2 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors" title="Reply">
                      <Reply className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/10 text-white/60 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {contacts.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
            <p className="text-white/40 italic">No contact messages found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
