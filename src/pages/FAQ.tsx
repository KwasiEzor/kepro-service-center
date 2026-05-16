import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Search, HelpCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useSEO } from '../hooks/useSEO';
import { FAQ as FAQType, ApiResponse } from '../types';

export default function FAQ() {
  const { t, i18n } = useTranslation();
  useSEO({
    title: t('faq.title'),
    description: t('faq.subtitle')
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<FAQType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await api.get<ApiResponse<{ data: FAQType[], pagination: any }>>('/api/public/faqs');
        setFaqs(response.data.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch FAQs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const lang = i18n.language.startsWith('fr') ? 'Fr' : 'En';

  const localizedFaqs = faqs.map(f => ({
    question: (f as any)[`question${lang}`],
    answer: (f as any)[`answer${lang}`]
  }));

  const filteredFaqs = localizedFaqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <Loader2 className="w-12 h-12 text-brand-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20">
      <section className="px-6 sm:px-12 max-w-4xl mx-auto text-center mb-16">
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           className="w-20 h-20 bg-brand-red clip-angular-md flex items-center justify-center mx-auto mb-8 bg-glow-red"
        >
          <HelpCircle className="w-10 h-10 text-white" />
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">{t('faq.title')}</h1>
        <p className="text-white/60 text-lg mb-10">{t('faq.subtitle')}</p>

        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder={t('faq.search.placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass bg-white/5 border-white/10 clip-angular-sm py-4 px-12 focus:outline-none focus:border-brand-red focus:bg-white/10 transition-all text-white placeholder:text-white/20"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
        </div>
      </section>

      <section className="px-6 sm:px-12 max-w-3xl mx-auto">
        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={idx}
              className="glass border-white/5 rounded-[30px] overflow-hidden transition-all duration-300 hover:border-white/10"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-8 py-6 flex items-center justify-between text-left group"
              >
                <span className={cn(
                  "text-lg font-bold transition-colors",
                  openIndex === idx ? "text-brand-red" : "text-white group-hover:text-white/80"
                )}>
                  {faq.question}
                </span>
                <div className={cn(
                  "w-8 h-8 clip-angular-sm flex items-center justify-center transition-all",
                  openIndex === idx ? "bg-brand-red rotate-180" : "bg-white/5"
                )}>
                  {openIndex === idx ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-8 pb-8 text-white/50 leading-relaxed text-sm">
                      <div className="pt-4 border-t border-white/5">
                        {faq.answer}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          
          {filteredFaqs.length === 0 && (
            <div className="text-center py-20 opacity-40">
              <p className="text-lg italic">{t('faq.noResults')}</p>
            </div>
          )}
        </div>

        {/* Still have questions? */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 p-10 glass clip-angular-lg text-center"
        >
          <h3 className="text-2xl font-bold mb-4">{t('faq.cta.title')}</h3>
          <p className="text-white/40 mb-8 max-w-md mx-auto">{t('faq.cta.description')}</p>
          <button 
            onClick={() => window.location.href = '/contact'}
            className="bg-white text-brand-blue px-8 py-3 clip-angular-sm font-bold hover:scale-105 transition-transform"
          >
            {t('faq.cta.button')}
          </button>
        </motion.div>
      </section>
    </div>
  );
}
