import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CarSelector from '../components/CarSelector';
import DocumentTemplate from '../components/DocumentTemplate';
import {
  Car,
  Key,
  Settings,
  Cpu,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Zap,
  Lock,
  ShieldCheck,
  Info,
  FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { useSEO } from '../hooks/useSEO';
import { quoteFormSchema, type QuoteFormData } from '../lib/validation';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { ApiResponse, ServiceType } from '../types';

type Step = 'service' | 'vehicle' | 'details' | 'success';

export default function Quote() {
  const { t } = useTranslation();
  useSEO({
    title: t('nav.quote'),
    description: t('quote.header.description')
  });
  const [step, setStep] = React.useState<Step>('service');
  const [serviceType, setServiceType] = React.useState('');
  const [refId, setRefId] = React.useState('');
  const [showDocument, setShowDocument] = React.useState(false);
  const [submittedData, setSubmittedData] = React.useState<QuoteFormData | null>(null);

  const serviceOptions = [
    { id: 'keys', label: t('quote.services.keys.label'), icon: Key, description: t('quote.services.keys.description') },
    { id: 'diagnostic', label: t('quote.services.diagnostic.label'), icon: Cpu, description: t('quote.services.diagnostic.description') },
    { id: 'immobilizer', label: t('quote.services.immobilizer.label'), icon: Settings, description: t('quote.services.immobilizer.description') },
    { id: 'other', label: t('quote.services.other.label'), icon: Zap, description: t('quote.services.other.description') },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    trigger,
    watch,
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
  });

  const brand = watch('brand');
  const model = watch('model');

  const handleNext = async () => {
    if (step === 'service') {
      if (!serviceType) return;
      setValue('serviceType', serviceType as ServiceType);
      setStep('vehicle');
    } else if (step === 'vehicle') {
      const isValid = await trigger(['brand', 'model', 'year', 'location']);
      if (isValid) setStep('details');
    }
  };

  const onSubmit = async (data: QuoteFormData) => {
    try {
      const response = await api.post<ApiResponse>('/api/public/quote', data);
      if (response.data.data) {
        setSubmittedData(data);
        setRefId(response.data.data.id.toUpperCase().slice(-6));
        setStep('success');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to submit. Please call us directly.';
      toast.error(message);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 sm:px-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[var(--color-brand-orange-primary)]/10 to-[var(--color-brand-orange-secondary)]/10 blur-[120px] clip-angular-sm" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-[var(--color-brand-orange-primary)]/10 to-[var(--color-brand-orange-secondary)]/10 blur-[120px] clip-angular-sm" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Premium Header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2.5 clip-angular-sm bg-gradient-to-r from-[var(--color-brand-orange-primary)]/10 to-[var(--color-brand-orange-secondary)]/10 border border-border-primary text-xs font-bold tracking-widest uppercase mb-8 backdrop-blur-xl"
          >
            <Zap className="w-3.5 h-3.5 text-[var(--color-brand-orange-primary)]" />
            <span className="text-[var(--color-brand-orange-primary)]">
              {t('quote.header.badge')}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-black mb-4 leading-[1.1]"
          >
            <span className="block text-text-primary">{t('quote.header.titlePart1')}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)] animate-gradient">
              {t('quote.header.titlePart2')}
            </span>
          </motion.h1>
        </div>

        {/* Premium Step Indicator */}
        {step !== 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-20"
          >
            {['service', 'vehicle', 'details'].map((s, idx) => (
              <React.Fragment key={s}>
                <motion.div
                  animate={{
                    scale: step === s ? 1.1 : 1,
                    opacity: step === s ? 1 : 0.4
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <div className={cn(
                    "relative w-10 h-10 clip-angular-sm flex items-center justify-center text-sm font-black transition-all",
                    step === s
                      ? "bg-gradient-to-br from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)] text-white shadow-lg shadow-[var(--color-brand-orange-primary)]/50"
                      : "bg-bg-secondary border border-border-primary text-text-tertiary"
                  )}>
                    <span className="relative z-10">{idx + 1}</span>
                    {step === s && (
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)] clip-angular-sm blur-md opacity-50 animate-pulse" />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-widest hidden sm:block transition-colors",
                    step === s ? "text-text-primary" : "text-text-tertiary"
                  )}>
                    {t(`quote.steps.${s}`)}
                  </span>
                </motion.div>
                {idx < 2 && (
                  <div className={cn(
                    "w-16 h-0.5 clip-angular-sm transition-all",
                    ['service', 'vehicle', 'details'].indexOf(step) > idx
                      ? "bg-gradient-to-r from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)]"
                      : "bg-border-primary"
                  )} />
                )}
              </React.Fragment>
            ))}
          </motion.div>
        )}

        {/* Premium Form Container */}
        <div className="relative p-1 clip-angular-xl bg-gradient-to-br from-border-primary to-border-secondary">
          <div className="backdrop-blur-2xl bg-bg-secondary clip-angular-lg overflow-hidden border border-border-primary shadow-2xl">
            <AnimatePresence mode="wait">
              {step === 'service' && (
                <motion.div
                  key="step-service"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 md:p-16"
                >
                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-display font-black mb-4 text-text-primary">
                      {t('quote.header.description')}
                    </h2>
                    <p className="text-text-secondary text-lg">{t('quote.header.description')}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {serviceOptions.map((opt, i) => (
                      <motion.button
                        key={opt.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        onClick={() => setServiceType(opt.id)}
                        className={cn(
                          "group relative flex items-start gap-6 p-8 clip-angular-md border-2 text-left transition-all",
                          serviceType === opt.id
                            ? "border-[var(--color-brand-orange-primary)]/50 bg-gradient-to-br from-[var(--color-brand-orange-primary)]/10 to-[var(--color-brand-orange-secondary)]/10"
                            : "border-border-primary bg-bg-tertiary hover:border-border-secondary"
                        )}
                      >
                        {/* Glow effect when selected */}
                        {serviceType === opt.id && (
                          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-orange-primary)]/20 to-[var(--color-brand-orange-secondary)]/20 clip-angular-md blur-xl -z-10 animate-pulse" />
                        )}

                        <div className={cn(
                          "w-14 h-14 clip-angular-sm flex items-center justify-center transition-all shadow-xl",
                          serviceType === opt.id
                            ? "bg-gradient-to-br from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)] text-white"
                            : "bg-bg-secondary text-text-tertiary group-hover:bg-bg-tertiary"
                        )}>
                          <opt.icon className="w-7 h-7" />
                        </div>

                        <div className="flex-1">
                          <h3 className={cn(
                            "font-bold text-lg mb-2 transition-colors",
                            serviceType === opt.id ? "text-text-primary" : "text-text-primary/90"
                          )}>
                            {opt.label}
                          </h3>
                          <p className="text-sm text-text-tertiary leading-relaxed">
                            {opt.description}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <motion.button
                      disabled={!serviceType}
                      onClick={handleNext}
                      whileHover={{ scale: serviceType ? 1.05 : 1 }}
                      whileTap={{ scale: serviceType ? 0.95 : 1 }}
                      className="group relative inline-flex items-center gap-3 px-10 py-5 clip-angular-sm font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <div className={cn(
                        "absolute inset-0 clip-angular-sm transition-all",
                        serviceType
                          ? "bg-gradient-to-r from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)]"
                          : "bg-bg-secondary"
                      )} />
                      <div className={cn(
                        "absolute inset-0 clip-angular-sm blur-xl opacity-0 transition-opacity",
                        serviceType && "opacity-50 bg-gradient-to-r from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)]"
                      )} />
                      <span className="relative z-10 text-white">{t('quote.form.next')}</span>
                      <ChevronRight className="relative z-10 w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 'vehicle' && (
                <motion.div
                  key="step-vehicle"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 md:p-16"
                >
                  <button
                    onClick={() => setStep('service')}
                    className="group flex items-center gap-2 text-xs font-bold text-text-tertiary hover:text-text-primary transition-colors mb-10 uppercase tracking-widest"
                  >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {t('quote.form.back')}
                  </button>

                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-display font-black mb-4 text-text-primary">
                      {t('quote.steps.vehicle')}
                    </h2>
                    <p className="text-text-secondary text-lg">{t('quote.header.description')}</p>
                  </div>

                  <div className="space-y-6 mb-12">
                    <CarSelector
                      brandValue={brand}
                      modelValue={model}
                      onBrandChange={(val) => setValue('brand', val, { shouldValidate: true })}
                      onModelChange={(val) => setValue('model', val, { shouldValidate: true })}
                      errorBrand={errors.brand?.message}
                      errorModel={errors.model?.message}
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-text-tertiary uppercase tracking-widest px-2">
                          {t('quote.form.year.label')}
                        </label>
                        <input
                          {...register('year')}
                          type="text"
                          placeholder={t('quote.form.year.placeholder')}
                          className="w-full bg-bg-tertiary border border-border-primary text-text-primary backdrop-blur-xl clip-angular-sm py-4 px-6 focus:outline-none focus:border-[var(--color-brand-orange-primary)] focus:ring-2 focus:ring-[var(--color-brand-orange-primary)]/20 transition-all placeholder:text-text-tertiary/50"
                        />
                        {errors.year && (
                          <p className="text-red-400 text-xs px-2 flex items-center gap-1">
                            <Info className="w-3 h-3" /> {errors.year.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-text-tertiary uppercase tracking-widest px-2">
                          {t('quote.form.location.label')}
                        </label>
                        <input
                          {...register('location')}
                          type="text"
                          placeholder={t('quote.form.location.placeholder')}
                          className="w-full bg-bg-tertiary border border-border-primary text-text-primary backdrop-blur-xl clip-angular-sm py-4 px-6 focus:outline-none focus:border-[var(--color-brand-orange-primary)] focus:ring-2 focus:ring-[var(--color-brand-orange-primary)]/20 transition-all placeholder:text-text-tertiary/50"
                        />
                        {errors.location && (
                          <p className="text-red-400 text-xs px-2 flex items-center gap-1">
                            <Info className="w-3 h-3" /> {errors.location.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <motion.button
                      onClick={handleNext}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative inline-flex items-center gap-3 px-10 py-5 clip-angular-sm font-bold text-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)] clip-angular-sm" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)] clip-angular-sm blur-xl opacity-50" />
                      <span className="relative z-10 text-white">{t('quote.form.finalStep')}</span>
                      <ChevronRight className="relative z-10 w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 'details' && (
                <motion.div
                  key="step-details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 md:p-16"
                >
                  <button
                    onClick={() => setStep('vehicle')}
                    className="group flex items-center gap-2 text-xs font-bold text-text-tertiary hover:text-text-primary transition-colors mb-10 uppercase tracking-widest"
                  >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {t('quote.form.backToVehicle')}
                  </button>

                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-display font-black mb-4 text-text-primary">
                      {t('quote.form.detailsTitle')}
                    </h2>
                    <p className="text-text-secondary text-lg">{t('quote.form.detailsSubtitle')}</p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-text-tertiary uppercase tracking-widest px-2">
                        {t('quote.form.name.label')}
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        placeholder={t('quote.form.name.placeholder')}
                        className="w-full bg-bg-tertiary border border-border-primary text-text-primary backdrop-blur-xl clip-angular-sm py-4 px-6 focus:outline-none focus:border-[var(--color-brand-orange-primary)] focus:ring-2 focus:ring-[var(--color-brand-orange-primary)]/20 transition-all placeholder:text-text-tertiary/50"
                      />
                      {errors.name && (
                        <p className="text-red-400 text-xs px-2 flex items-center gap-1">
                          <Info className="w-3 h-3" /> {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-text-tertiary uppercase tracking-widest px-2">
                        {t('quote.form.phone.label')}
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        placeholder="01 23 45 67 89"
                        className="w-full bg-bg-tertiary border border-border-primary text-text-primary backdrop-blur-xl clip-angular-sm py-4 px-6 focus:outline-none focus:border-[var(--color-brand-orange-primary)] focus:ring-2 focus:ring-[var(--color-brand-orange-primary)]/20 transition-all placeholder:text-text-tertiary/50"
                      />
                      {errors.phone && (
                        <p className="text-red-400 text-xs px-2 flex items-center gap-1">
                          <Info className="w-3 h-3" /> {errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <label className="block text-xs font-bold text-text-tertiary uppercase tracking-widest px-2">
                        {t('quote.form.email.label')}
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="john@example.com"
                        className="w-full bg-bg-tertiary border border-border-primary text-text-primary backdrop-blur-xl clip-angular-sm py-4 px-6 focus:outline-none focus:border-[var(--color-brand-orange-primary)] focus:ring-2 focus:ring-[var(--color-brand-orange-primary)]/20 transition-all placeholder:text-text-tertiary/50"
                      />
                      {errors.email && (
                        <p className="text-red-400 text-xs px-2 flex items-center gap-1">
                          <Info className="w-3 h-3" /> {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <label className="block text-xs font-bold text-text-tertiary uppercase tracking-widest px-2">
                        {t('quote.form.description.label')}
                      </label>
                      <textarea
                        {...register('message')}
                        placeholder={t('quote.form.description.placeholder')}
                        rows={5}
                        className="w-full bg-bg-tertiary border border-border-primary text-text-primary backdrop-blur-xl clip-angular-md py-4 px-6 focus:outline-none focus:border-[var(--color-brand-orange-primary)] focus:ring-2 focus:ring-[var(--color-brand-orange-primary)]/20 transition-all resize-none placeholder:text-text-tertiary/50"
                      />
                    </div>

                    <div className="md:col-span-2 mt-6">
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                        className="group relative w-full py-6 clip-angular-sm font-black text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)] clip-angular-sm animate-gradient" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)] clip-angular-sm blur-xl opacity-50" />
                        <span className="relative z-10 text-white">
                          {isSubmitting ? t('quote.form.submitting') : t('quote.form.submit')}
                        </span>
                      </motion.button>

                      <p 
                        className="text-[10px] text-text-tertiary text-center mt-8 uppercase tracking-widest leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: t('quote.form.consent') }}
                      />
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="step-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-12 md:p-24 text-center relative"
                >
                  {/* Animated Success Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="relative w-32 h-32 mx-auto mb-12"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 clip-angular-sm flex items-center justify-center shadow-2xl">
                      <CheckCircle2 className="w-16 h-16 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 clip-angular-sm blur-2xl opacity-50 animate-pulse" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-5xl md:text-6xl font-display font-black mb-6 text-text-primary"
                  >
                    {t('quote.success.title')}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg md:text-xl text-text-secondary mb-16 max-w-lg mx-auto leading-relaxed"
                  >
                    {t('quote.success.description')}
                  </motion.p>

                  {/* Premium Info Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="inline-block mb-16"
                  >
                    <div className="relative p-1 clip-angular-md bg-gradient-to-br from-border-primary to-border-secondary">
                      <div className="backdrop-blur-xl bg-bg-tertiary p-8 rounded-[22px] border border-border-primary text-left min-w-[320px]">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-bg-secondary clip-angular-sm flex items-center justify-center">
                            <Zap className="w-5 h-5 text-orange-400" />
                          </div>
                          <span className="font-bold text-sm uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)]">
                            {t('quote.success.subtitle')}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="text-text-tertiary">{t('quote.success.refNumber')}</span>
                            <span className="ml-3 font-mono font-bold text-text-primary bg-bg-secondary px-3 py-1 rounded-lg">{refId}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                  >
                    <motion.button
                      onClick={() => setShowDocument(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative inline-flex items-center gap-3 px-12 py-5 clip-angular-sm font-bold text-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 border border-border-primary clip-angular-sm" />
                      <FileText className="relative z-10 w-5 h-5 text-white" />
                      <span className="relative z-10 text-white">
                        {t('quote.success.viewReceipt')}
                      </span>
                    </motion.button>

                    <motion.button
                      onClick={() => window.location.href = '/'}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative inline-flex items-center gap-3 px-12 py-5 clip-angular-sm font-bold text-lg"
                    >
                      <div className="absolute inset-0 bg-bg-secondary border border-border-primary clip-angular-sm" />
                      <span className="relative z-10 text-text-primary group-hover:text-text-primary/90 transition-colors">
                        {t('quote.success.done')}
                      </span>
                    </motion.button>
                  </motion.div>

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
                          className="relative w-full max-w-4xl print:max-w-none"
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
                              type="quote" 
                              data={{
                                ...submittedData,
                                id: refId,
                                createdAt: new Date().toISOString(),
                                status: 'PENDING'
                              } as any} 
                              refId={refId}
                            />
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Premium Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8"
        >
          {[
            { icon: MapPin, text: 'Nationwide Service' },
            { icon: Lock, text: 'Secure Data Handling' },
            { icon: ShieldCheck, text: 'Certified Technicians' }
          ].map((badge, i) => (
            <motion.div
              key={badge.text}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="flex items-center gap-3 px-4 py-2 bg-bg-secondary border border-border-primary clip-angular-sm"
            >
              <badge.icon className="w-4 h-4 text-text-tertiary" />
              <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                {badge.text}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
