import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { Image as ImageType } from '../../types';
import { 
  Image, 
  Upload, 
  Trash2, 
  Loader2, 
  Plus, 
  X,
  AlertCircle
} from 'lucide-react';
import { cn, formatImageUrl } from '../../lib/utils';
import { config } from '../../lib/config';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { useTable } from '../../hooks/useTable';

const CATEGORIES = [
  { id: 'all', label: 'All Images' },
  { id: 'brands', label: 'Brands' },
  { id: 'services', label: 'Services' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'hero', label: 'Hero' },
];

export default function GalleryManagement() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  
  const endpoint = `/api/admin/images${activeCategory === 'all' ? '' : `?category=${activeCategory}`}`;
  
  const {
    data: images,
    loading,
    page,
    setPage,
    pagination,
    refetch
  } = useTable<ImageType>(endpoint, { initialLimit: 18 });

  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('gallery');
  const [altText, setAltText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('category', uploadCategory);
    formData.append('alt', altText);

    try {
      const response = await fetch(`${config.apiUrl}/api/admin/images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      toast.success('Image uploaded successfully');
      await refetch();
      setShowUploadModal(false);
      resetUploadForm();
    } catch (error: any) {
      setUploadError(error.message);
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setAltText('');
    setUploadCategory('gallery');
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await api.delete(`/api/admin/images/${id}`);
      toast.success('Image deleted successfully');
      await refetch();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete image';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Image className="w-6 h-6 text-brand-red" />
            {t('dashboard.admin.sections.gallery.title')}
          </h2>
          <p className="text-text-tertiary text-sm">{t('dashboard.admin.sections.gallery.desc')}</p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-red text-white font-bold clip-angular-sm hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5" />
          {t('dashboard.admin.sections.gallery.action')}
        </button>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              setPage(1); // Reset to first page when changing category
            }}
            className={cn(
              "px-4 py-2 text-xs font-bold uppercase tracking-widest clip-angular-sm border transition-all",
              activeCategory === cat.id
                ? "bg-brand-red border-brand-red text-white"
                : "bg-bg-secondary border-border-primary text-text-tertiary hover:border-border-primary hover:text-text-primary"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-pulse">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square bg-bg-secondary rounded-xl" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <EmptyState
          icon={Image}
          title={t('dashboard.common.noData')}
          description="Images will appear here once uploaded."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {images.map((img) => (
              <div key={img.id} className="group relative aspect-square card-dark overflow-hidden">
                <img
                  src={formatImageUrl(img.url)}
                  alt={img.alt || ''}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-red px-2 py-1 rounded">
                    {img.category}
                  </span>
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="p-3 bg-bg-secondary hover:bg-red-500/20 text-red-500 rounded-full transition-colors"
                    title="Delete Image"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => !uploading && setShowUploadModal(false)}
          />
          
          <div className="relative w-full max-w-xl card-dark p-8 md:p-12 overflow-hidden animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-bg-secondary rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Upload className="w-8 h-8 text-brand-red" />
              Upload Image
            </h2>

            <form onSubmit={handleUpload} className="space-y-6">
              {/* Dropzone/Input */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative aspect-video border-2 border-dashed border-border-primary rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-brand-red/50 transition-all overflow-hidden group",
                  selectedFile && "border-green-500/50"
                )}
              >
                {selectedFile ? (
                  <>
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-contain p-4"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                      <p className="text-sm font-bold">Change Image</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-bg-secondary rounded-full group-hover:scale-110 transition-transform">
                      <Plus className="w-8 h-8 text-text-tertiary" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold">Click to select</p>
                      <p className="text-xs text-text-tertiary">PNG, JPG or WebP (Max 5MB)</p>
                    </div>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              {/* Category & Alt Text */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-tertiary ml-2">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-primary clip-angular-sm py-4 px-4 focus:outline-none focus:border-brand-red transition-all text-text-primary"
                  >
                    <option value="gallery">Gallery</option>
                    <option value="brands">Brands</option>
                    <option value="services">Services</option>
                    <option value="hero">Hero</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-tertiary ml-2">Alt Text</label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Brief description"
                    className="w-full bg-bg-secondary border border-border-primary clip-angular-sm py-4 px-4 focus:outline-none focus:border-brand-red transition-all text-text-primary placeholder:text-text-tertiary"
                  />
                </div>
              </div>

              {uploadError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {uploadError}
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className={cn(
                  "w-full py-5 clip-angular-sm font-black text-xl flex items-center justify-center gap-3 transition-all",
                  selectedFile && !uploading
                    ? "bg-brand-red hover:scale-[1.02] shadow-lg shadow-brand-red/20"
                    : "bg-bg-secondary text-text-tertiary cursor-not-allowed"
                )}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    UPLOADING...
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6" />
                    START UPLOAD
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
