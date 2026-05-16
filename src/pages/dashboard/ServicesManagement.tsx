import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Service, ApiResponse } from '../../types';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<{ data: Service[], pagination: any }>>('/api/admin/services');
      setServices(response.data.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      nameEn: formData.get('nameEn'),
      nameFr: formData.get('nameFr'),
      descriptionEn: formData.get('descriptionEn'),
      descriptionFr: formData.get('descriptionFr'),
      category: formData.get('category'),
      icon: formData.get('icon'),
      priceFrom: formData.get('priceFrom') ? parseFloat(formData.get('priceFrom') as string) : null,
      duration: formData.get('duration'),
      active: formData.get('active') === 'on',
      order: parseInt(formData.get('order') as string) || 0
    };

    try {
      if (editingService) {
        await api.patch(`/api/admin/services/${editingService.id}`, data);
      } else {
        await api.post('/api/admin/services', data);
      }
      await fetchServices();
      setShowModal(false);
      setEditingService(null);
    } catch (error) {
      console.error('Failed to save service:', error);
      alert('Error saving service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/api/admin/services/${id}`);
      setServices(services.filter(s => s.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-red" />
            Services Management
          </h2>
          <p className="text-white/40 text-sm">Create and edit the services offered on your site</p>
        </div>
        <button
          onClick={() => { setEditingService(null); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-brand-red text-white font-bold clip-angular-sm hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-12 h-12 text-brand-red animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <div key={service.id} className="card-dark p-6 flex items-center justify-between group">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white/5 clip-angular-sm flex items-center justify-center text-brand-red">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    {service.nameEn} / {service.nameFr}
                    {!service.active && <EyeOff className="w-3 h-3 text-white/20" />}
                  </h3>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-brand-red/20 text-brand-red px-2 py-0.5 rounded">
                      {service.category || 'Uncategorized'}
                    </span>
                    <p className="text-xs text-white/40 line-clamp-1 max-w-md">{service.descriptionEn}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right mr-4">
                  <div className="text-xs font-bold text-white/60">Order: {service.order}</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-widest">
                    {service.priceFrom ? `From €${service.priceFrom}` : 'Contact for price'}
                  </div>
                </div>
                <button
                  onClick={() => { setEditingService(service); setShowModal(true); }}
                  className="p-3 hover:bg-white/10 text-white/60 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="p-3 hover:bg-red-500/10 text-red-500/60 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {services.length === 0 && (
             <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 italic text-white/20">
               No services defined yet.
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
            <h2 className="text-3xl font-bold mb-8">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/40 ml-2">Name (English)</label>
                <input name="nameEn" defaultValue={editingService?.nameEn} required className="w-full bg-white/5 border border-white/10 clip-angular-sm py-4 px-4 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/40 ml-2">Name (French)</label>
                <input name="nameFr" defaultValue={editingService?.nameFr} required className="w-full bg-white/5 border border-white/10 clip-angular-sm py-4 px-4 text-white" />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase text-white/40 ml-2">Description (English)</label>
                <textarea name="descriptionEn" defaultValue={editingService?.descriptionEn} required rows={3} className="w-full bg-white/5 border border-white/10 clip-angular-sm py-4 px-4 text-white resize-none" />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase text-white/40 ml-2">Description (French)</label>
                <textarea name="descriptionFr" defaultValue={editingService?.descriptionFr} required rows={3} className="w-full bg-white/5 border border-white/10 clip-angular-sm py-4 px-4 text-white resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/40 ml-2">Category</label>
                <select name="category" defaultValue={editingService?.category || 'keys'} className="w-full bg-white/5 border border-white/10 clip-angular-sm py-4 px-4 text-white">
                  <option value="keys">Keys & Remotes</option>
                  <option value="diagnostics">Diagnostics</option>
                  <option value="programming">Programming</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/40 ml-2">Price From (€)</label>
                <input name="priceFrom" type="number" step="0.01" defaultValue={editingService?.priceFrom || ''} className="w-full bg-white/5 border border-white/10 clip-angular-sm py-4 px-4 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/40 ml-2">Display Order</label>
                <input name="order" type="number" defaultValue={editingService?.order || 0} className="w-full bg-white/5 border border-white/10 clip-angular-sm py-4 px-4 text-white" />
              </div>
              <div className="flex items-center gap-3 py-8">
                <input name="active" type="checkbox" defaultChecked={editingService ? editingService.active : true} className="w-5 h-5 accent-brand-red" />
                <label className="font-bold text-sm">Visible on site</label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="col-span-2 mt-4 py-5 bg-brand-red font-black text-xl clip-angular-sm flex items-center justify-center gap-3"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                {editingService ? 'UPDATE SERVICE' : 'CREATE SERVICE'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
