import React from 'react';
import { motion } from 'motion/react';
import { Shield, Target, Users, Zap, Award, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { useSEO } from '../hooks/useSEO';

export default function About() {
  const { t } = useTranslation();
  useSEO({
    title: t('nav.about'),
    description: t('about.hero.description')
  });

  const values = [
    {
      title: t('about.values.excellence.title'),
      text: t('about.values.excellence.description'),
      icon: Target
    },
    {
      title: t('about.values.mobile.title'),
      text: t('about.values.mobile.description'),
      icon: Globe
    },
    {
      title: t('about.values.reliability.title'),
      text: t('about.values.reliability.description'),
      icon: Shield
    }
  ];

  const timeline = [
    { year: "2018", title: t('about.journey.timeline.launch.title'), desc: t('about.journey.timeline.launch.desc') },
    { year: "2020", title: t('about.journey.timeline.tech.title'), desc: t('about.journey.timeline.tech.desc') },
    { year: "2022", title: t('about.journey.timeline.regional.title'), desc: t('about.journey.timeline.regional.desc') },
    { year: "2024", title: t('about.journey.timeline.ai.title'), desc: t('about.journey.timeline.ai.desc') }
  ];
  return (
    <div className="pt-32 pb-20">
      <section className="px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-black mb-8 tracking-tight leading-[1.05]">
              <span className="block text-white">{t('about.hero.title1')}</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)] text-glow-strong animate-gradient">
                {t('about.hero.title2')}
              </span>
            </h1>
            <p className="text-xl text-white/60 leading-relaxed max-w-xl">
              {t('about.hero.description')}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="clip-angular-lg overflow-hidden shadow-2xl border border-white/10">
              <img 
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=1200" 
                alt="Our Engineering Team"
                className="w-full grayscale brightness-75 hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Visual accent */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--color-brand-orange-primary)]/20 blur-3xl -z-10" />
          </motion.div>
        </div>

        {/* Vision/Values */}
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((v, idx) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="glass p-10 rounded-[35px] border-white/5 hover:bg-white/10 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <v.icon className="w-20 h-20 text-white" />
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)] clip-angular-sm flex items-center justify-center p-3 mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-[var(--color-brand-orange-primary)]/20">
                <v.icon className="w-full h-full text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{v.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {v.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Experience Timeline */}
      <section className="py-32 px-6 sm:px-12 bg-white/5 mt-32">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">{t('about.journey.title')}</h2>
          <p className="text-white/60 text-lg">{t('about.journey.subtitle')}</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-20 relative">
          {/* Vertical Line */}
          <div className="absolute left-[30px] md:left-1/2 top-0 bottom-0 w-px bg-white/10" />

          {timeline.map((item, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              key={item.year} 
              className={cn(
                "flex flex-col md:flex-row items-center gap-8 md:gap-20",
                idx % 2 === 0 ? "md:flex-row-reverse" : ""
              )}
            >
              {/* Content Box - Desktop Alternating */}
              <div className="flex-1 hidden md:block">
                <div className={idx % 2 === 0 ? "text-left" : "text-right"}>
                  <h3 className="text-3xl font-display font-black text-white mb-2 uppercase tracking-tighter">
                    {item.title}
                  </h3>
                  <p className="text-white/40 leading-relaxed text-sm">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Year Bubble */}
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)] clip-angular-sm flex items-center justify-center font-black text-white relative z-10 border-4 border-[var(--color-brand-dark)] bg-glow-orange shrink-0">
                {item.year.slice(2)}
              </div>

              {/* Content Box - Mobile & Desktop Placeholder */}
              <div className="flex-1">
                <div className="md:hidden text-center">
                  <h3 className="text-2xl font-bold mb-2 uppercase tracking-tight">{item.title}</h3>
                  <p className="text-white/40 text-sm">{item.desc}</p>
                </div>
                {/* Empty div for desktop alternating layout */}
                <div className="hidden md:block" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

