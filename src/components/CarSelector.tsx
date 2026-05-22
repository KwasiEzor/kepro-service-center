import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Check, Car } from 'lucide-react';
import { cn } from '../lib/utils';
import carData from '../misc/car-list.json';
import { useTranslation } from 'react-i18next';

interface CarBrand {
  brand: string;
  models: string[];
}

interface CarSelectorProps {
  brandValue: string;
  modelValue: string;
  onBrandChange: (brand: string) => void;
  onModelChange: (model: string) => void;
  errorBrand?: string;
  errorModel?: string;
}

export default function CarSelector({
  brandValue,
  modelValue,
  onBrandChange,
  onModelChange,
  errorBrand,
  errorModel
}: CarSelectorProps) {
  const { t } = useTranslation();
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  
  const brandRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  const brands = (carData as CarBrand[]).map(c => c.brand).sort();
  const selectedBrandData = (carData as CarBrand[]).find(c => c.brand === brandValue);
  const models = selectedBrandData ? selectedBrandData.models.sort() : [];

  const filteredBrands = brands.filter(b => 
    b.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const filteredModels = models.filter(m => 
    m.toLowerCase().includes(modelSearch.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (brandRef.current && !brandRef.current.contains(event.target as Node)) {
        setIsBrandOpen(false);
      }
      if (modelRef.current && !modelRef.current.contains(event.target as Node)) {
        setIsModelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-6 w-full">
      {/* Brand Selection */}
      <div className="space-y-3 relative" ref={brandRef}>
        <label className="block text-xs font-bold text-text-tertiary uppercase tracking-widest px-2">
          {t('quote.form.brand.label')}
        </label>
        <div 
          onClick={() => setIsBrandOpen(!isBrandOpen)}
          className={cn(
            "w-full bg-bg-tertiary border text-text-primary backdrop-blur-xl clip-angular-sm py-4 px-6 flex items-center justify-between cursor-pointer transition-all",
            isBrandOpen ? "border-[var(--color-brand-orange-primary)] ring-2 ring-[var(--color-brand-orange-primary)]/20" : "border-border-primary hover:border-border-secondary",
            errorBrand && "border-red-500/50"
          )}
        >
          <div className="flex items-center gap-3">
            <Car className={cn("w-4 h-4", brandValue ? "text-[var(--color-brand-orange-primary)]" : "text-text-tertiary")} />
            <span className={cn(brandValue ? "text-text-primary" : "text-text-tertiary/50")}>
              {brandValue || t('quote.form.brand.placeholder')}
            </span>
          </div>
          <ChevronDown className={cn("w-4 h-4 transition-transform", isBrandOpen && "rotate-180")} />
        </div>

        {isBrandOpen && (
          <div className="absolute z-50 w-full mt-2 bg-bg-tertiary border border-border-primary clip-angular-md shadow-2xl backdrop-blur-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 border-b border-border-primary">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  autoFocus
                  type="text"
                  placeholder={t('quote.form.brandSearch.placeholder')}
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-bg-secondary border border-border-primary text-sm py-2 pl-10 pr-4 clip-angular-sm focus:outline-none focus:border-[var(--color-brand-orange-primary)] transition-all"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {filteredBrands.length > 0 ? (
                filteredBrands.map((brand) => (
                  <div
                    key={brand}
                    onClick={() => {
                      onBrandChange(brand);
                      onModelChange(''); // Reset model when brand changes
                      setIsBrandOpen(false);
                      setBrandSearch('');
                    }}
                    className={cn(
                      "px-6 py-3 text-sm cursor-pointer flex items-center justify-between transition-colors",
                      brandValue === brand ? "bg-[var(--color-brand-orange-primary)]/10 text-[var(--color-brand-orange-primary)] font-bold" : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                    )}
                  >
                    {brand}
                    {brandValue === brand && <Check className="w-4 h-4" />}
                  </div>
                ))
              ) : (
                <div className="px-6 py-4 text-sm text-text-tertiary italic">{t('quote.form.brandSearch.empty')}</div>
              )}
            </div>
          </div>
        )}
        {errorBrand && (
          <p className="text-red-400 text-xs px-2 flex items-center gap-1 mt-1">
            <span className="w-1 h-1 rounded-full bg-red-400" /> {errorBrand}
          </p>
        )}
      </div>

      {/* Model Selection */}
      <div className="space-y-3 relative" ref={modelRef}>
        <label className="block text-xs font-bold text-text-tertiary uppercase tracking-widest px-2">
          {t('quote.form.model.label')}
        </label>
        <div 
          onClick={() => brandValue && setIsModelOpen(!isModelOpen)}
          className={cn(
            "w-full bg-bg-tertiary border text-text-primary backdrop-blur-xl clip-angular-sm py-4 px-6 flex items-center justify-between transition-all",
            !brandValue ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
            isModelOpen ? "border-[var(--color-brand-orange-primary)] ring-2 ring-[var(--color-brand-orange-primary)]/20" : "border-border-primary hover:border-border-secondary",
            errorModel && "border-red-500/50"
          )}
        >
          <div className="flex items-center gap-3">
            <Car className={cn("w-4 h-4", modelValue ? "text-[var(--color-brand-orange-primary)]" : "text-text-tertiary")} />
            <span className={cn(modelValue ? "text-text-primary" : "text-text-tertiary/50")}>
              {modelValue || (brandValue ? t('quote.form.model.placeholder') : t('quote.form.model.placeholder'))}
            </span>
          </div>
          <ChevronDown className={cn("w-4 h-4 transition-transform", isModelOpen && "rotate-180")} />
        </div>

        {isModelOpen && brandValue && (
          <div className="absolute z-50 w-full mt-2 bg-bg-tertiary border border-border-primary clip-angular-md shadow-2xl backdrop-blur-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 border-b border-border-primary">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  autoFocus
                  type="text"
                  placeholder={t('quote.form.model.search')}
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-bg-secondary border border-border-primary text-sm py-2 pl-10 pr-4 clip-angular-sm focus:outline-none focus:border-[var(--color-brand-orange-primary)] transition-all"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {filteredModels.length > 0 ? (
                filteredModels.map((model) => (
                  <div
                    key={model}
                    onClick={() => {
                      onModelChange(model);
                      setIsModelOpen(false);
                      setModelSearch('');
                    }}
                    className={cn(
                      "px-6 py-3 text-sm cursor-pointer flex items-center justify-between transition-colors",
                      modelValue === model ? "bg-[var(--color-brand-orange-primary)]/10 text-[var(--color-brand-orange-primary)] font-bold" : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                    )}
                  >
                    {model}
                    {modelValue === model && <Check className="w-4 h-4" />}
                  </div>
                ))
              ) : (
                <div className="px-6 py-4 text-sm text-text-tertiary italic">{t('quote.form.model.empty')}</div>
              )}
            </div>
          </div>
        )}
        {errorModel && (
          <p className="text-red-400 text-xs px-2 flex items-center gap-1 mt-1">
            <span className="w-1 h-1 rounded-full bg-red-400" /> {errorModel}
          </p>
        )}
      </div>
    </div>
  );
}
