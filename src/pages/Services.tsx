import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { LazyImage } from '../components/LazyImage';
import {
  Key,
  Settings,
  Cpu,
  ShieldCheck,
  Zap,
  Microchip,
  Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, getLocalizedField } from '../lib/utils';
import { api } from '../lib/api';
import { useSEO } from '../hooks/useSEO';
import { Service, ApiResponse } from '../types';

const serviceImages: Record<string, string> = {
  keys: "/images/services/car-keys.jpg",
  diagnostics: "/images/services/diagnostics.jpg",
  programming: "/images/services/programming.jpg",
  other: "/images/services/other.jpg"
};

const categoryIcons: Record<string, React.ElementType> = {
  keys: Key,
  diagnostics: Cpu,
  programming: Microchip,
  other: Settings
};

export default function Services() {
  const { t, i18n } = useTranslation();
  useSEO({
    title: t('nav.services'),
    description: t('services.header.description')
  });
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get<ApiResponse<{ data: Service[], pagination: any }>>('/api/public/services');
        setServices(response.data.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const currentLang = i18n.language || 'fr';
  const lang = currentLang.startsWith('fr') ? 'Fr' : 'En';

  // Group services by category
  const categories = Array.from(new Set(services.map(s => s.category || 'other')));
  
  const serviceCategories = categories.map(cat => ({
    id: cat,
    title: t(`services.categories.${cat}.title`, { defaultValue: cat.charAt(0).toUpperCase() + cat.slice(1) }),
    description: t(`services.categories.${cat}.description`, { defaultValue: '' }),
    services: services.filter(s => (s.category || 'other') === cat).map(s => ({
      name: getLocalizedField(s, 'name', lang),
      detail: getLocalizedField(s, 'description', lang),
      price: s.priceFrom
    })),
    icon: categoryIcons[cat] || Settings,
    image: serviceImages[cat] || serviceImages.other
  }));

  const brands = [
    t('services.brandCoverage.brands.volkswagen'),
    t('services.brandCoverage.brands.audi'),
    t('services.brandCoverage.brands.bmw'),
    t('services.brandCoverage.brands.mercedes'),
    t('services.brandCoverage.brands.porsche'),
    t('services.brandCoverage.brands.landRover'),
    t('services.brandCoverage.brands.peugeot'),
    t('services.brandCoverage.brands.renault')
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <Loader2 className="w-12 h-12 text-brand-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative pt-32 pb-0">
      {/* Header */}
      <section className="px-6 sm:px-12 mb-24 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-2.5 clip-angular-sm bg-gradient-to-r from-[var(--color-brand-orange-primary)]/10 to-[var(--color-brand-orange-secondary)]/10 border border-border-primary text-xs font-bold tracking-widest uppercase mb-8 backdrop-blur-xl"
          >
            <Settings className="w-3.5 h-3.5 text-[var(--color-brand-orange-primary)]" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)]">
              {t('services.header.badge')}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-6xl md:text-8xl font-display font-black mb-8 tracking-tight leading-[1.05]"
          >
            <span className="block text-text-primary">{t('services.header.titlePart1')}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)] animate-gradient">
              {t('services.header.titlePart2')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {t('services.header.description')}
          </motion.p>
        </section>

        {/* Premium Services Showcase */}
        <section className="px-6 sm:px-12 max-w-7xl mx-auto space-y-40 relative z-10">
          {serviceCategories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className={cn(
                "flex flex-col lg:flex-row gap-16 items-center",
                idx % 2 !== 0 && "lg:flex-row-reverse"
              )}
            >
              {/* Content Side */}
              <div className="flex-1 space-y-10">
                {/* Icon + Title */}
                <motion.div
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-6"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-brand-orange-primary)]/20 to-[var(--color-brand-orange-secondary)]/20 clip-angular-md flex items-center justify-center border border-border-primary backdrop-blur-xl">
                    <cat.icon className="w-10 h-10 text-[var(--color-brand-orange-primary)]" />
                  </div>
                  <h2 className="text-4xl md:text-6xl font-display font-black leading-none text-text-primary">
                    {cat.title}
                  </h2>
                </motion.div>

                {/* Description */}
                {cat.description && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="text-xl leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {cat.description}
                  </motion.p>
                )}

                {/* Service Grid */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="grid sm:grid-cols-2 gap-4 pt-4"
                >
                  {cat.services.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="group relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 p-6 clip-angular-md border border-border-primary hover:border-border-primary transition-all"
                    >
                      {/* Gradient glow on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 clip-angular-md transition-all duration-300 -z-10" />

                      <h4 className="font-bold mb-2 text-sm" style={{ color: 'var(--color-text-primary)' }}>{s.name}</h4>
                      <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                        {s.detail}
                      </p>
                      {s.price && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-red">
                          From €{s.price}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Image Side with Premium Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="flex-1 relative group"
              >
                <div className="relative p-1 clip-angular-xl bg-gradient-to-br from-white/20 to-white/5">
                  <div className="relative clip-angular-lg overflow-hidden aspect-[4/3] border border-border-primary shadow-2xl">
                    <LazyImage
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-purple-600/30 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-dark)] via-transparent to-transparent opacity-80" />
                  </div>
                </div>

                <div className={cn(
                  "absolute -z-10 w-full h-full clip-angular-xl bg-gradient-to-br from-[var(--color-brand-orange-primary)]/20 to-[var(--color-brand-orange-secondary)]/20 blur-3xl transition-all duration-700 group-hover:blur-2xl group-hover:scale-105",
                  idx % 2 === 0 ? "top-8 right-8" : "top-8 left-8"
                )} />
              </motion.div>
            </motion.div>
          ))}
        </section>

        {/* Empty State */}
        {services.length === 0 && (
          <section className="text-center py-40 opacity-40">
             <p className="text-2xl font-bold italic">No services listed at the moment.</p>
          </section>
        )}

        {/* Premium Brand Coverage Banner */}
        <section className="mt-40 py-24 relative overflow-hidden mb-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-secondary/20 to-transparent" />
          <div className="absolute inset-0 border-y border-border-secondary" />

          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-6 py-2.5 clip-angular-sm border text-xs font-bold tracking-widest uppercase backdrop-blur-xl bg-bg-secondary border-border-primary">
                <ShieldCheck className="w-3.5 h-3.5 text-text-tertiary" />
                <span className="text-text-tertiary">{t('services.brandCoverage.title')}</span>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {brands.map((brand, i) => (
                <motion.div
                  key={brand}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4, opacity: 1 }}
                  className="group flex items-center justify-center p-8 backdrop-blur-xl clip-angular-md border hover:border-border-primary transition-all cursor-default bg-bg-secondary border-border-primary"
                >
                  <span className="text-lg md:text-xl font-display font-black tracking-tight group-hover:text-text-secondary transition-colors text-text-tertiary">
                    {brand}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
    </div>
  );
}
