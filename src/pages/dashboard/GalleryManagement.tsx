import React, { useEffect, useState, useRef } from 'react';
import { api } from '../../lib/api';
import { Image as ImageType, ApiResponse } from '../../types';
import { 
  Image, 
  Upload, 
  Trash2, 
  Loader2, 
  Plus, 
  X,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn, formatImageUrl } from '../../lib/utils';

const CATEGORIES = [
  { id: 'all', label: 'All Images' },
  { id: 'brands', label: 'Brands' },
  { id: 'services', label: 'Services' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'hero', label: 'Hero' },
];

export default function GalleryManagement() {
  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('gallery');
  const [altText, setAltText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const categoryParam = activeCategory === 'all' ? '' : `?category=${activeCategory}`;
      const response = await api.get<ApiResponse<ImageType[]>>(`/api/admin/images${categoryParam}`);
      setImages(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [activeCategory]);

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
      // Note: Our ApiClient needs to handle FormData correctly. 
      // Fetch does this automatically if we don't set Content-Type manually.
      // We need to check if our ApiClient sets Content-Type.
      
      const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3001'}/api/admin/images/upload`, {
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

      await fetchImages();
      setShowUploadModal(false);
      resetUploadForm();
    } catch (error: any) {
      setUploadError(error.message);
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
      setImages(images.filter(img => img.id !== id));
    } catch (error) {
      console.error('Failed to delete image:', error);
      alert('Failed to delete image.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Image className="w-6 h-6 text-brand-red" />
            Gallery Management
          </h2>
          <p className="text-white/40 text-sm">Manage brand logos and service images</p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-red text-white font-bold clip-angular-sm hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5" />
          Upload Image
        </button>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-4 py-2 text-xs font-bold uppercase tracking-widest clip-angular-sm border transition-all",
              activeCategory === cat.id
                ? "bg-brand-red border-brand-red text-white"
                : "bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-12 h-12 text-brand-red animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square card-dark overflow-hidden group">
              <img
                src={formatImageUrl(img.url)}
                alt={img.alt || ''}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-red px-2 py-1 rounded">
                  {img.category}
                </span>
                <button
                  onClick={() => handleDelete(img.id)}
                  className="p-3 bg-white/10 hover:bg-red-500/20 text-red-500 rounded-full transition-colors"
                  title="Delete Image"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          
          {images.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-white/5">
              <p className="text-white/40 italic">No images found in this category.</p>
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !uploading && setShowUploadModal(false)}
          />
          
          <div className="relative w-full max-w-xl card-dark p-8 md:p-12 overflow-hidden animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
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
                  "relative aspect-video border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-brand-red/50 transition-all overflow-hidden group",
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
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-sm font-bold">Change Image</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform">
                      <Plus className="w-8 h-8 text-white/40" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold">Click to select</p>
                      <p className="text-xs text-white/40">PNG, JPG or WebP (Max 5MB)</p>
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
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 clip-angular-sm py-4 px-4 focus:outline-none focus:border-brand-red transition-all text-white"
                  >
                    <option value="gallery">Gallery</option>
                    <option value="brands">Brands</option>
                    <option value="services">Services</option>
                    <option value="hero">Hero</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Alt Text</label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Brief description"
                    className="w-full bg-white/5 border border-white/10 clip-angular-sm py-4 px-4 focus:outline-none focus:border-brand-red transition-all text-white placeholder:text-white/20"
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
                    : "bg-white/10 text-white/20 cursor-not-allowed"
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
