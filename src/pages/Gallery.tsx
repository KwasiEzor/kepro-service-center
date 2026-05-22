import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useSEO } from '../hooks/useSEO';
import { Image as ImageType, ApiResponse } from '../types';
import { formatImageUrl } from '../lib/utils';
import { 
  Camera, 
  Filter, 
  Loader2, 
  X, 
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Tag
} from 'lucide-react';
import { cn } from '../lib/utils';

const CATEGORIES = [
  { id: 'all', key: 'all' },
  { id: 'cars', key: 'cars' },
  { id: 'keys', key: 'keys' },
  { id: 'diagnostics', key: 'diagnostics' },
  { id: 'services', key: 'services' },
];

export default function Gallery() {
  const { t } = useTranslation();
  useSEO({ 
    title: t('nav.gallery'),
    description: t('gallery.header.description')
  });

  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0
  });

  const fetchImages = async (page: number) => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<{
        images: ImageType[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>>(`/api/public/gallery?page=${page}&limit=9`);
      
      const { images: newImages, pagination: meta } = response.data.data;
      setImages(newImages);
      setPagination(meta);
    } catch (error) {
      console.error('Failed to fetch gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchImages(newPage);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Keep client-side filtering for search keywords, but pagination is server-side
  const filteredImages = images.filter(img => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'cars') return img.category === 'gallery' && (img.alt?.toLowerCase().includes('car') || img.alt?.toLowerCase().includes('auto'));
    if (activeCategory === 'keys') return img.category === 'gallery' && img.alt?.toLowerCase().includes('key');
    if (activeCategory === 'diagnostics') return img.category === 'gallery' && img.alt?.toLowerCase().includes('diag');
    return img.category === activeCategory;
  });

  const nextImage = () => {
    if (selectedImage === null) return;
    setSelectedImage((selectedImage + 1) % filteredImages.length);
  };

  const prevImage = () => {
    if (selectedImage === null) return;
    setSelectedImage((selectedImage - 1 + filteredImages.length) % filteredImages.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage === null) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  return (
    <>
      <div className="relative pt-20 pb-20">
      {/* Hero Header */}
      <section className="relative py-24 px-6 border-b border-border-secondary overflow-hidden">
            <div className="container mx-auto max-w-7xl relative z-10">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange-primary/10 border border-brand-orange-primary/20 rounded-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <Camera className="w-4 h-4 text-brand-orange-primary" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-orange-primary">
                    {t('gallery.header.badge')}
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                  {t('gallery.header.titlePart1')}{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-primary to-orange-400">
                    {t('gallery.header.titlePart2')}
                  </span>
                </h1>
                
                <p className="max-w-2xl text-lg leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200" style={{ color: 'var(--color-text-tertiary)' }}>
                  {t('gallery.header.description')}
                </p>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="relative py-20 px-6">
            <div className="container mx-auto max-w-7xl">
              {/* Filters */}
              <div className="flex flex-wrap justify-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "px-8 py-3 text-sm font-black italic uppercase tracking-widest transition-all duration-300 border-2",
                      activeCategory === cat.id
                        ? "bg-brand-orange-primary border-brand-orange-primary text-black scale-105 shadow-lg shadow-brand-orange-primary/20"
                        : "border-border-primary hover:border-border-primary hover:text-text-primary"
                    )}
                    style={activeCategory !== cat.id ? { backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-tertiary)' } : undefined}
                  >
                    {t(`gallery.filters.${cat.key}`)}
                  </button>
                ))}
              </div>

              {/* Grid */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-6">
                  <Loader2 className="w-16 h-16 text-brand-orange-primary animate-spin" />
                  <p className="font-bold uppercase tracking-widest animate-pulse" style={{ color: 'var(--color-text-tertiary)' }}>
                    {t('common.loading')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredImages.map((img, index) => (
                    <div
                      key={img.id}
                      onClick={() => setSelectedImage(index)}
                      className="group relative aspect-[4/3] overflow-hidden cursor-pointer animate-in fade-in zoom-in duration-500"
                      style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border-primary)',
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      <img
                        src={formatImageUrl(img.url)}
                        alt={img.alt || ''}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[50%] group-hover:grayscale-0"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                      
                      {/* Content */}
                      <div className="absolute inset-0 p-8 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-brand-orange-primary text-black text-[10px] font-black italic uppercase tracking-widest">
                            {img.alt?.toLowerCase().includes('key') ? 'KEY' : 
                            img.alt?.toLowerCase().includes('diag') ? 'DIAG' : 
                            img.alt?.toLowerCase().includes('car') ? 'CAR' : img.category}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                            <Calendar className="w-3 h-3" />
                            {new Date(img.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-xl font-black italic text-text-primary uppercase tracking-tight line-clamp-1">
                          {img.alt || 'Technical Intervention'}
                        </h3>
                        
                        <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                          <span className="text-brand-orange-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                            {t('gallery.viewImage')}
                            <Maximize2 className="w-4 h-4" />
                          </span>
                        </div>
                      </div>

                      {/* Corner Accent */}
                      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-brand-orange-primary/0 group-hover:border-brand-orange-primary transition-all duration-500" />
                      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-brand-orange-primary/0 group-hover:border-brand-orange-primary transition-all duration-500" />
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {!loading && pagination.totalPages > 1 && (
                <div className="mt-20 flex justify-center items-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-3 glass border disabled:opacity-20 hover:bg-brand-orange-primary hover:text-black transition-all border-border-primary text-text-primary clip-angular-sm"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={cn(
                          "w-12 h-12 flex items-center justify-center font-black italic transition-all",
                          pagination.page === p
                            ? "bg-brand-orange-primary text-black scale-110 shadow-lg shadow-brand-orange-primary/20"
                            : "glass border hover:text-text-primary"
                        )}
                        style={{
                          clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
                          ...(pagination.page !== p ? { borderColor: 'var(--color-border-primary)', color: 'var(--color-text-tertiary)' } : {})
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-3 glass border disabled:opacity-20 hover:bg-brand-orange-primary hover:text-black transition-all"
                    style={{
                      clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
                      borderColor: 'var(--color-border-primary)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!loading && filteredImages.length === 0 && (
                <div className="py-40 text-center space-y-6">
                  <div className="inline-block p-6 bg-bg-secondary rounded-full mb-4">
                    <Camera className="w-12 h-12" style={{ color: 'var(--color-text-tertiary)', opacity: 0.7 }} />
                  </div>
                  <p className="text-2xl font-black italic uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>
                    {t('gallery.empty')}
                  </p>
                </div>
              )}
            </div>
          </section>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 lg:p-12">
          <div
            className="absolute inset-0 backdrop-blur-xl animate-in fade-in duration-300"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
            onClick={() => setSelectedImage(null)}
          />
          
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 md:top-10 md:right-10 z-[110] p-3 bg-bg-secondary hover:bg-white/20 rounded-full text-text-primary transition-all hover:rotate-90"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 md:left-10 z-[110] p-4 bg-bg-secondary hover:bg-brand-orange-primary hover:text-black rounded-full text-white transition-all transform hover:scale-110 active:scale-95 group"
          >
            <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 md:right-10 z-[110] p-4 bg-bg-secondary hover:bg-brand-orange-primary hover:text-black rounded-full text-white transition-all transform hover:scale-110 active:scale-95 group"
          >
            <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="relative w-full max-w-6xl h-full flex flex-col items-center justify-center animate-in zoom-in fade-in duration-300">
            <img
              src={formatImageUrl(filteredImages[selectedImage].url)}
              alt={filteredImages[selectedImage].alt || ''}
              className="max-w-full max-h-[80vh] object-contain shadow-2xl shadow-brand-orange-primary/10"
            />
            
            <div className="mt-8 text-center space-y-4 max-w-2xl px-6">
              <div className="flex items-center justify-center gap-4">
                <span className="px-4 py-1.5 bg-brand-orange-primary text-black text-xs font-black italic uppercase tracking-[0.2em]">
                  {filteredImages[selectedImage].category}
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.1em] flex items-center gap-2" style={{ color: 'var(--color-text-tertiary)' }}>
                  <Calendar className="w-4 h-4" />
                  {new Date(filteredImages[selectedImage].createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black italic text-text-primary uppercase tracking-tighter">
                {filteredImages[selectedImage].alt || 'Technical Intervention'}
              </h2>
            </div>
            
            {/* Counter */}
            <div className="absolute bottom-0 font-black italic text-sm tracking-[0.5em] mb-4" style={{ color: 'var(--color-text-tertiary)', opacity: 0.7 }}>
              {String(selectedImage + 1).padStart(2, '0')} / {String(filteredImages.length).padStart(2, '0')}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
