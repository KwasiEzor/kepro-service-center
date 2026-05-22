import React from 'react';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  ExternalLink,
  Instagram,
  Facebook,
  Linkedin,
  FileText,
  XCircle,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSEO } from '../hooks/useSEO';
import { contactFormSchema, type ContactFormData } from '../lib/validation';
import DocumentTemplate from '../components/DocumentTemplate';
import { AnimatePresence } from 'motion/react';

import { toast } from 'sonner';
import { api } from '../lib/api';

export default function Contact() {
  const { t } = useTranslation();
  useSEO({
    title: t('nav.contact'),
    description: t('contact.header.description')
  });
  const [formState, setFormState] = React.useState<'idle' | 'submitting' | 'success'>('idle');
  const [showDocument, setShowDocument] = React.useState(false);
  const [submittedData, setSubmittedData] = React.useState<ContactFormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setFormState('submitting');

    try {
      await api.post('/api/public/contact', data);
      setSubmittedData(data);
      setFormState('success');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to send. Please call us directly.';
      toast.error(message);
      setFormState('idle');
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 sm:px-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[var(--color-brand-orange-primary)]/10 to-[var(--color-brand-orange-secondary)]/10 blur-[120px] clip-angular-sm" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-[var(--color-brand-orange-primary)]/10 to-[var(--color-brand-orange-secondary)]/10 blur-[120px] clip-angular-sm" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-6 py-2.5 clip-angular-sm bg-gradient-to-r from-[var(--color-brand-orange-primary)]/10 to-[var(--color-brand-orange-secondary)]/10 border border-border-primary text-xs font-bold tracking-widest uppercase mb-8 backdrop-blur-xl"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[var(--color-brand-orange-primary)]" />
              <span className="text-[var(--color-brand-orange-primary)]">
                {t('contact.header.badge')}
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-display font-black mb-8 leading-[1.05]">
              <span className="block text-text-primary">{t('contact.header.title')}</span>
            </h1>

            <p className="text-xl leading-relaxed mb-16 max-w-lg text-text-secondary" dangerouslySetInnerHTML={{ __html: t('contact.header.description') }} />

            {/* Premium Contact Cards */}
            <div className="space-y-6">
              {[
                { icon: Phone, label: t('contact.contactInfo.hotline.label'), value: t('contact.contactInfo.hotline.value'), detail: t('contact.contactInfo.hotline.detail'), gradient: "from-[var(--color-brand-orange-primary)]/20 to-[var(--color-brand-orange-secondary)]/20", iconColor: "text-[var(--color-brand-orange-primary)]" },
                { icon: Mail, label: t('contact.contactInfo.support.label'), value: t('contact.contactInfo.support.value'), detail: t('contact.contactInfo.support.detail'), gradient: "from-[var(--color-brand-orange-secondary)]/20 to-[var(--color-brand-orange-light)]/20", iconColor: "text-[var(--color-brand-orange-secondary)]" },
                { icon: MapPin, label: t('contact.contactInfo.location.label'), value: t('contact.contactInfo.location.value'), detail: t('contact.contactInfo.location.detail'), gradient: "from-[var(--color-brand-orange-primary)]/15 to-[var(--color-brand-orange-secondary)]/15", iconColor: "text-[var(--color-brand-orange-primary)]" }
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ x: 8, scale: 1.02 }}
                  className="group"
                >
                  <div className="relative p-1 clip-angular-md bg-gradient-to-br from-border-primary to-border-secondary">
                    <div className="flex gap-6 items-start p-6 backdrop-blur-xl bg-gradient-to-br from-bg-secondary to-bg-tertiary rounded-[22px] border border-border-primary">
                      <div className={cn(
                        "w-14 h-14 clip-angular-sm flex items-center justify-center bg-gradient-to-br transition-transform group-hover:scale-110 shadow-xl",
                        item.gradient
                      )}>
                        <item.icon className={cn("w-7 h-7", item.iconColor)} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-2 text-text-tertiary">
                          {item.label}
                        </p>
                        <p className="text-lg md:text-xl font-bold mb-1 transition-colors text-text-primary">
                          {item.value}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-16 flex items-center gap-4"
            >
              {[
                { icon: Instagram, name: 'Instagram' },
                { icon: Facebook, name: 'Facebook' },
                { icon: Linkedin, name: 'LinkedIn' }
              ].map((social, i) => (
                <motion.a
                  key={social.name}
                  href="#"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                  whileHover={{ scale: 1.1, y: -4 }}
                  className="w-12 h-12 backdrop-blur-xl border border-border-primary bg-bg-secondary text-text-secondary clip-angular-sm flex items-center justify-center hover:text-text-primary hover:border-[var(--color-brand-orange-primary)]/50 hover:bg-[var(--color-brand-orange-primary)]/10 transition-all"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Premium Form Side */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative p-1 clip-angular-xl bg-gradient-to-br from-border-primary to-border-secondary">
              <div className="backdrop-blur-2xl bg-bg-secondary p-8 md:p-12 clip-angular-lg border border-border-primary relative overflow-hidden">
                {/* Animated Gradient Orbs */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--color-brand-orange-primary)]/20 to-[var(--color-brand-orange-secondary)]/20 blur-[100px] -z-10"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.1, 0.15, 0.1],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-[100px] -z-10"
                />

                <h2 className="text-4xl font-display font-black mb-10 relative z-10 text-text-primary">
                  {t('contact.form.title')}
                </h2>
              
                {formState === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 relative z-10"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="relative w-24 h-24 mx-auto mb-8"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 clip-angular-sm flex items-center justify-center shadow-2xl">
                        <Send className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 clip-angular-sm blur-2xl opacity-50 animate-pulse" />
                    </motion.div>
                    <h3 className="text-3xl font-display font-black mb-3 text-text-primary">{t('contact.form.success.title')}</h3>
                    <p className="text-lg text-text-tertiary mb-10">{t('contact.form.success.description')}</p>
                    
                    <div className="flex flex-col gap-4">
                      <motion.button
                        onClick={() => setShowDocument(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative w-full py-4 clip-angular-sm font-bold flex items-center justify-center gap-3"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 border border-border-primary clip-angular-sm" />
                        <FileText className="relative z-10 w-5 h-5 text-white" />
                        <span className="relative z-10 text-white">View & Print Summary</span>
                      </motion.button>
                      
                      <motion.button
                        onClick={() => setFormState('idle')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-xs font-bold uppercase tracking-widest text-text-tertiary hover:text-text-primary transition-colors"
                      >
                        Send another message
                      </motion.button>
                    </div>

                    {/* Document Modal/Overlay */}
                    <AnimatePresence>
                      {showDocument && submittedData && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto pt-20 pb-20 print:p-0 print:bg-white print:static print:overflow-visible"
                        >
                          <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl print:max-w-none text-left"
                          >
                            {/* Close Button - Hidden in Print */}
                            <button
                              onClick={() => setShowDocument(false)}
                              className="absolute -top-12 right-0 text-white hover:text-orange-400 transition-colors flex items-center gap-2 font-bold uppercase tracking-widest text-xs print:hidden"
                            >
                              <span className="mr-1">Close</span> <XCircle className="w-6 h-6" />
                            </button>

                            {/* Print Action - Hidden in Print */}
                            <button
                              onClick={() => window.print()}
                              className="absolute -top-12 left-0 text-white hover:text-emerald-400 transition-colors flex items-center gap-2 font-bold uppercase tracking-widest text-xs print:hidden"
                            >
                              <ShieldCheck className="w-6 h-6" /> Print / Save as PDF
                            </button>

                            <div className="print:m-0">
                              <DocumentTemplate 
                                type="contact" 
                                data={{
                                  ...submittedData,
                                  id: 'PENDING',
                                  createdAt: new Date().toISOString(),
                                  status: 'NEW'
                                } as any} 
                              />
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-widest px-2 text-text-secondary">
                        {t('contact.form.name.label')}
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        className="w-full bg-bg-tertiary border border-border-primary text-text-primary backdrop-blur-xl clip-angular-sm py-4 px-6 focus:outline-none focus:border-[var(--color-brand-orange-primary)] focus:ring-2 focus:ring-[var(--color-brand-orange-primary)]/20 transition-all"
                        placeholder={t('contact.form.name.placeholder')}
                      />
                      {errors.name && (
                        <p className="text-red-400 text-xs px-2">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-widest px-2 text-text-secondary">
                        {t('contact.form.email.label')}
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full bg-bg-tertiary border border-border-primary text-text-primary backdrop-blur-xl clip-angular-sm py-4 px-6 focus:outline-none focus:border-[var(--color-brand-orange-primary)] focus:ring-2 focus:ring-[var(--color-brand-orange-primary)]/20 transition-all"
                        placeholder={t('contact.form.email.placeholder')}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-xs px-2">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-widest px-2 text-text-secondary">
                        {t('contact.form.topic.label')}
                      </label>
                      <select
                        {...register('topic')}
                        className="w-full bg-bg-tertiary border border-border-primary text-text-primary backdrop-blur-xl clip-angular-sm py-4 px-6 focus:outline-none focus:border-[var(--color-brand-orange-primary)] focus:ring-2 focus:ring-[var(--color-brand-orange-primary)]/20 transition-all appearance-none cursor-pointer"
                      >
                        <option className="bg-bg-secondary text-text-primary">{t('contact.form.topic.options.general')}</option>
                        <option className="bg-bg-secondary text-text-primary">{t('contact.form.topic.options.support')}</option>
                        <option className="bg-bg-secondary text-text-primary">{t('contact.form.topic.options.b2b')}</option>
                        <option className="bg-bg-secondary text-text-primary">{t('contact.form.topic.options.careers')}</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-widest px-2 text-text-secondary">
                        {t('contact.form.message.label')}
                      </label>
                      <textarea
                        {...register('message')}
                        rows={5}
                        className="w-full bg-bg-tertiary border border-border-primary text-text-primary backdrop-blur-xl clip-angular-md py-4 px-6 focus:outline-none focus:border-[var(--color-brand-orange-primary)] focus:ring-2 focus:ring-[var(--color-brand-orange-primary)]/20 transition-all resize-none"
                        placeholder={t('contact.form.message.placeholder')}
                      />
                      {errors.message && (
                        <p className="text-red-400 text-xs px-2">{errors.message.message}</p>
                      )}
                    </div>

                    <motion.button
                      type="submit"
                      disabled={formState === 'submitting'}
                      whileHover={{ scale: formState === 'submitting' ? 1 : 1.02 }}
                      whileTap={{ scale: formState === 'submitting' ? 1 : 0.98 }}
                      className="group relative w-full py-6 clip-angular-sm font-black text-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)] clip-angular-sm animate-gradient" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)] clip-angular-sm blur-xl opacity-50" />
                      {formState === 'submitting' ? (
                        <>
                          <span className="relative z-10 text-white">{t('contact.form.submitting')}</span>
                          <span className="relative z-10 w-5 h-5 border-2 border-border-primary border-t-white clip-angular-sm animate-spin" />
                        </>
                      ) : (
                        <>
                          <span className="relative z-10 text-white">{t('contact.form.submit')}</span>
                          <Send className="relative z-10 w-5 h-5 text-white" />
                        </>
                      )}
                    </motion.button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
