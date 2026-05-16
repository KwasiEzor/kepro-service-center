import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { FAQ, ApiResponse } from '../../types';
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2, 
  X, 
  CheckCircle2,
  EyeOff
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function FaqManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<{ data: FAQ[], pagination: any }>>('/api/admin/faqs');
      setFaqs(response.data.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      questionEn: formData.get('questionEn'),
      questionFr: formData.get('questionFr'),
      answerEn: formData.get('answerEn'),
      answerFr: formData.get('answerFr'),
      category: formData.get('category'),
      active: formData.get('active') === 'on',
      order: parseInt(formData.get('order') as string) || 0
    };

    try {
      if (editingFaq) {
        await api.patch(`/api/admin/faqs/${editingFaq.id}`, data);
      } else {
        await api.post('/api/admin/faqs', data);
      }
      await fetchFaqs();
      setShowModal(false);
      setEditingFaq(null);
    } catch (error) {
      console.error('Failed to save FAQ:', error);
      alert('Error saving FAQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await api.delete(`/api/admin/faqs/${id}`);
      setFaqs(faqs.filter(f => f.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-brand-red" />
            FAQ Management
          </h2>
          <p className="text-white/40 text-sm">Manage frequently asked questions and answers</p>
        </div>
        <button
          onClick={() => { setEditingFaq(null); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-brand-red text-white font-bold clip-angular-sm hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5" />
          Add FAQ
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-12 h-12 text-brand-red animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="card-dark p-6 flex items-center justify-between group">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white/5 clip-angular-sm flex items-center justify-center text-brand-red">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    {faq.questionEn}
                    {!faq.active && <EyeOff className="w-3 h-3 text-white/20" />}
                  </h3>
                  <p className="text-xs text-white/40 line-clamp-1 max-w-md">{faq.answerEn}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right mr-4 text-xs font-bold text-white/60">
                   Order: {faq.order}
                </div>
                <button
                  onClick={() => { setEditingFaq(faq); setShowModal(true); }}
                  className="p-3 hover:bg-white/10 text-white/60 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="p-3 hover:bg-red-500/10 text-red-500/60 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {faqs.length === 0 && (
             <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 italic text-white/20">
               No FAQs defined yet.
             </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isSubmitting && setShowModal(false)} />
          <div className="relative w-full max-w-2xl card-dark p-8 md:p-12 animate-in fade-in zoom-in duration-300">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-3xl font-bold mb-8">{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-white/40 ml-2">Question (English)</label>
                  <input name="questionEn" defaultValue={editingFaq?.questionEn} required className="w-full bg-white/5 border border-white/10 clip-angular-sm py-4 px-4 text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-white/40 ml-2">Question (French)</label>
                  <input name="questionFr" defaultValue={editingFaq?.questionFr} required className="w-full bg-white/5 border border-white/10 clip-angular-sm py-4 px-4 text-white" />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase text-white/40 ml-2">Answer (English)</label>
                  <textarea name="answerEn" defaultValue={editingFaq?.answerEn} required rows={4} className="w-full bg-white/5 border border-white/10 clip-angular-sm py-4 px-4 text-white resize-none" />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase text-white/40 ml-2">Answer (French)</label>
                  <textarea name="answerFr" defaultValue={editingFaq?.answerFr} required rows={4} className="w-full bg-white/5 border border-white/10 clip-angular-sm py-4 px-4 text-white resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-white/40 ml-2">Category</label>
                  <input name="category" defaultValue={editingFaq?.category || ''} className="w-full bg-white/5 border border-white/10 clip-angular-sm py-4 px-4 text-white" placeholder="e.g. General, Technical" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-white/40 ml-2">Display Order</label>
                  <input name="order" type="number" defaultValue={editingFaq?.order || 0} className="w-full bg-white/5 border border-white/10 clip-angular-sm py-4 px-4 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-3 py-2">
                <input name="active" type="checkbox" defaultChecked={editingFaq ? editingFaq.active : true} className="w-5 h-5 accent-brand-red" />
                <label className="font-bold text-sm">FAQ is active and visible on website</label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-5 bg-brand-red font-black text-xl clip-angular-sm flex items-center justify-center gap-3"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                {editingFaq ? 'UPDATE FAQ' : 'CREATE FAQ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
