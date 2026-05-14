import React from 'react';
import { motion } from 'motion/react';
import { LazyImage } from '../components/LazyImage';
import { ShieldCheck, Zap, Cpu, Key, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { useSEO } from '../hooks/useSEO';

export default function Brands() {
  const { t } = useTranslation();
  useSEO({
    title: t('nav.brands'),
    description: t('brands.subtitle')
  });

  // Premium car images for brand categories
  const categoryImages = {
    german: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1200",
    british: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=1200",
    french: "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=1200"
  };

  const brandCategories = [
    {
      title: t('brands.categories.german.title'),
      description: t('brands.categories.german.description'),
      image: categoryImages.german,
      brands: [
        { name: t('brands.categories.german.bmw.name'), series: t('brands.categories.german.bmw.series'), features: t('brands.categories.german.bmw.features', { returnObjects: true }) as string[] },
        { name: t('brands.categories.german.mercedes.name'), series: t('brands.categories.german.mercedes.series'), features: t('brands.categories.german.mercedes.features', { returnObjects: true }) as string[] },
        { name: t('brands.categories.german.audiVw.name'), series: t('brands.categories.german.audiVw.series'), features: t('brands.categories.german.audiVw.features', { returnObjects: true }) as string[] },
        { name: t('brands.categories.german.porsche.name'), series: t('brands.categories.german.porsche.series'), features: t('brands.categories.german.porsche.features', { returnObjects: true }) as string[] }
      ]
    },
    {
      title: t('brands.categories.british.title'),
      description: t('brands.categories.british.description'),
      image: categoryImages.british,
      brands: [
        { name: t('brands.categories.british.landRover.name'), series: t('brands.categories.british.landRover.series'), features: t('brands.categories.british.landRover.features', { returnObjects: true }) as string[] },
        { name: t('brands.categories.british.jaguar.name'), series: t('brands.categories.british.jaguar.series'), features: t('brands.categories.british.jaguar.features', { returnObjects: true }) as string[] }
      ]
    },
    {
      title: t('brands.categories.french.title'),
      description: t('brands.categories.french.description'),
      image: categoryImages.french,
      brands: [
        { name: t('brands.categories.french.renault.name'), series: t('brands.categories.french.renault.series'), features: t('brands.categories.french.renault.features', { returnObjects: true }) as string[] },
        { name: t('brands.categories.french.peugeot.name'), series: t('brands.categories.french.peugeot.series'), features: t('brands.categories.french.peugeot.features', { returnObjects: true }) as string[] }
      ]
    }
  ];

  return (
    <div className="pt-32 pb-20">
      <section className="px-6 sm:px-12 max-w-7xl mx-auto text-center mb-32">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-display font-bold mb-8"
        >
          {t('brands.title')}
        </motion.h1>
        <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
          {t('brands.subtitle')}
        </p>
      </section>

      <section className="px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="space-y-32">
          {brandCategories.map((cat, idx) => (
            <motion.div 
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
                <div className="max-w-xl">
                  <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">{cat.title}</h2>
                  <p className="text-lg text-white/40">{cat.description}</p>
                </div>
                <div className="flex items-center gap-2 text-brand-red font-bold uppercase tracking-widest text-xs">
                  <ShieldCheck className="w-5 h-5" /> {t('brands.certification')}
                </div>
              </div>

              {/* Hero car image */}
              <div className="relative clip-angular-xl overflow-hidden aspect-[21/9] border border-white/10">
                <LazyImage
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {cat.brands.map((brand) => (
                  <div key={brand.name} className="glass p-10 clip-angular-lg hover:bg-white/5 transition-all group border-white/5">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-4xl font-display font-black tracking-tighter mb-1 tracking-wider text-white group-hover:text-brand-red transition-colors">{brand.name}</h3>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">{brand.series}</p>
                      </div>
                      <div className="w-12 h-12 glass clip-angular-sm flex items-center justify-center p-3">
                         <Cpu className="text-white/40 w-full h-full" />
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                       {brand.features.map(f => (
                         <span key={f} className="text-[10px] font-bold uppercase tracking-widest border border-white/10 px-3 py-1.5 clip-angular-sm text-white/50 group-hover:border-brand-red/30 group-hover:text-white transition-all">
                           {f}
                         </span>
                       ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Verification footer */}
      <section className="mt-32 px-6 sm:px-12">
        <div className="max-w-4xl mx-auto glass p-12 rounded-[50px] text-center border-brand-red/10 overflow-hidden relative group">
           <div className="absolute inset-0 bg-brand-red/5 mix-blend-overlay group-hover:bg-brand-red/10 transition-colors" />
           <CheckCircle2 className="w-12 h-12 text-brand-red mx-auto mb-8 shadow-2xl" />
           <h3 className="text-2xl md:text-3xl font-display font-bold mb-6">{t('brands.cta.title')}</h3>
           <p className="text-white/40 max-w-xl mx-auto mb-10 leading-relaxed">
             {t('brands.cta.description')}
           </p>
           <button className="px-8 py-3 bg-white text-brand-blue clip-angular-sm font-bold hover:scale-105 transition-all bg-glow-red">
             {t('brands.cta.button')}
           </button>
        </div>
      </section>
    </div>
  );
}
