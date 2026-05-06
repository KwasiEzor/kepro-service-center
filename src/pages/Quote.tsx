import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Car, 
  Key, 
  Settings, 
  Cpu, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail,
  Zap,
  Lock,
  ShieldCheck,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { quoteFormSchema, type QuoteFormData } from '../lib/validation';

type Step = 'service' | 'vehicle' | 'details' | 'success';

const serviceOptions = [
  { id: 'keys', label: 'Car Key Specialist', icon: Key, description: 'Lost keys, spare keys, or remote repair' },
  { id: 'diagnostic', label: 'Full Diagnostics', icon: Cpu, description: 'ECU scans, sensor check, or performance logging' },
  { id: 'immobilizer', label: 'Immobilizer Repair', icon: Settings, description: 'ECU replacement or sync issues' },
  { id: 'other', label: 'Other Technical', icon: Zap, description: 'Module coding and specific electronic fixes' },
];

export default function Quote() {
  const [step, setStep] = React.useState<Step>('service');
  const [serviceType, setServiceType] = React.useState('');
  const [refId, setRefId] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
  });

  const handleNext = () => {
    if (step === 'service') {
      setValue('serviceType', serviceType as any);
      setStep('vehicle');
    } else if (step === 'vehicle') setStep('details');
  };

  const onSubmit = async (data: QuoteFormData) => {
    try {
      const response = await fetch('http://localhost:3001/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed');

      const result = await response.json();
      setRefId(result.refId);
      setStep('success');
    } catch (error) {
      console.error('Quote error:', error);
      alert('Failed to submit. Please call us directly.');
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 sm:px-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Premium Header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-white/10 text-xs font-bold tracking-widest uppercase mb-8 backdrop-blur-xl"
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Premium Mobile Technical Assistance
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-black mb-4 leading-[1.1]"
          >
            <span className="block text-white">Request</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient">
              Service
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
                    "relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all",
                    step === s
                      ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                      : "bg-white/5 border border-white/10 text-white/50"
                  )}>
                    <span className="relative z-10">{idx + 1}</span>
                    {step === s && (
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full blur-md opacity-50 animate-pulse" />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-widest hidden sm:block transition-colors",
                    step === s ? "text-white" : "text-white/40"
                  )}>
                    {s}
                  </span>
                </motion.div>
                {idx < 2 && (
                  <div className={cn(
                    "w-16 h-0.5 rounded-full transition-all",
                    ['service', 'vehicle', 'details'].indexOf(step) > idx
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                      : "bg-white/10"
                  )} />
                )}
              </React.Fragment>
            ))}
          </motion.div>
        )}

        {/* Premium Form Container */}
        <div className="relative p-1 rounded-[48px] bg-gradient-to-br from-white/10 to-white/5">
          <div className="backdrop-blur-2xl bg-gradient-to-br from-[#0A1F44]/80 to-[#020617]/80 rounded-[44px] overflow-hidden border border-white/10 shadow-2xl">
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
                    <h2 className="text-4xl md:text-5xl font-display font-black mb-4 text-white">
                      What do you need help with?
                    </h2>
                    <p className="text-white/60 text-lg">Select the primary service required for your vehicle.</p>
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
                          "group relative flex items-start gap-6 p-8 rounded-3xl border-2 text-left transition-all",
                          serviceType === opt.id
                            ? "border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-blue-500/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        )}
                      >
                        {/* Glow effect when selected */}
                        {serviceType === opt.id && (
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl -z-10 animate-pulse" />
                        )}

                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl",
                          serviceType === opt.id
                            ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white"
                            : "bg-white/10 text-white/50 group-hover:bg-white/15"
                        )}>
                          <opt.icon className="w-7 h-7" />
                        </div>

                        <div className="flex-1">
                          <h3 className={cn(
                            "font-bold text-lg mb-2 transition-colors",
                            serviceType === opt.id ? "text-white" : "text-white/90"
                          )}>
                            {opt.label}
                          </h3>
                          <p className="text-sm text-white/50 leading-relaxed">
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
                      className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <div className={cn(
                        "absolute inset-0 rounded-full transition-all",
                        serviceType
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                          : "bg-white/10"
                      )} />
                      <div className={cn(
                        "absolute inset-0 rounded-full blur-xl opacity-0 transition-opacity",
                        serviceType && "opacity-50 bg-gradient-to-r from-cyan-400 to-blue-400"
                      )} />
                      <span className="relative z-10 text-white">Continue</span>
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
                    className="group flex items-center gap-2 text-xs font-bold text-white/50 hover:text-white transition-colors mb-10 uppercase tracking-widest"
                  >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to service
                  </button>

                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-display font-black mb-4 text-white">
                      Vehicle Information
                    </h2>
                    <p className="text-white/60 text-lg">Provide the basic details of the vehicle requiring assistance.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-12">
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest px-2">
                        Brand
                      </label>
                      <input
                        {...register('brand')}
                        type="text"
                        placeholder="e.g. BMW, Audi, Mercedes"
                        className="w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-white placeholder:text-white/30"
                      />
                      {errors.brand && (
                        <p className="text-red-400 text-xs px-2 flex items-center gap-1">
                          <Info className="w-3 h-3" /> {errors.brand.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest px-2">
                        Model
                      </label>
                      <input
                        {...register('model')}
                        type="text"
                        placeholder="e.g. 5 Series, A4, G-Wagon"
                        className="w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-white placeholder:text-white/30"
                      />
                      {errors.model && (
                        <p className="text-red-400 text-xs px-2 flex items-center gap-1">
                          <Info className="w-3 h-3" /> {errors.model.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest px-2">
                        Year
                      </label>
                      <input
                        {...register('year')}
                        type="text"
                        placeholder="e.g. 2021"
                        className="w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-white placeholder:text-white/30"
                      />
                      {errors.year && (
                        <p className="text-red-400 text-xs px-2 flex items-center gap-1">
                          <Info className="w-3 h-3" /> {errors.year.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest px-2">
                        Location (City)
                      </label>
                      <input
                        {...register('location')}
                        type="text"
                        placeholder="e.g. Paris, Lyon, Marseille"
                        className="w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-white placeholder:text-white/30"
                      />
                      {errors.location && (
                        <p className="text-red-400 text-xs px-2 flex items-center gap-1">
                          <Info className="w-3 h-3" /> {errors.location.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <motion.button
                      onClick={handleNext}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold text-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full blur-xl opacity-50" />
                      <span className="relative z-10 text-white">Final Step</span>
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
                    className="group flex items-center gap-2 text-xs font-bold text-white/50 hover:text-white transition-colors mb-10 uppercase tracking-widest"
                  >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to vehicle
                  </button>

                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-display font-black mb-4 text-white">
                      Personal Details
                    </h2>
                    <p className="text-white/60 text-lg">How should our technical team contact you?</p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest px-2">
                        Full Name
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        placeholder="John Doe"
                        className="w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-white placeholder:text-white/30"
                      />
                      {errors.name && (
                        <p className="text-red-400 text-xs px-2 flex items-center gap-1">
                          <Info className="w-3 h-3" /> {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest px-2">
                        Phone Number
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        placeholder="01 23 45 67 89"
                        className="w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-white placeholder:text-white/30"
                      />
                      {errors.phone && (
                        <p className="text-red-400 text-xs px-2 flex items-center gap-1">
                          <Info className="w-3 h-3" /> {errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest px-2">
                        Email Address
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="john@example.com"
                        className="w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-white placeholder:text-white/30"
                      />
                      {errors.email && (
                        <p className="text-red-400 text-xs px-2 flex items-center gap-1">
                          <Info className="w-3 h-3" /> {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest px-2">
                        Additional Information (Optional)
                      </label>
                      <textarea
                        {...register('message')}
                        placeholder="Describe the issue in more detail..."
                        rows={5}
                        className="w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl py-4 px-6 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none text-white placeholder:text-white/30"
                      />
                    </div>

                    <div className="md:col-span-2 mt-6">
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                        className="group relative w-full py-6 rounded-full font-black text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full animate-gradient" />
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 rounded-full blur-xl opacity-50" />
                        <span className="relative z-10 text-white">
                          {isSubmitting ? 'SENDING...' : 'SEND REQUEST'}
                        </span>
                      </motion.button>

                      <p className="text-[10px] text-white/30 text-center mt-8 uppercase tracking-widest leading-relaxed">
                        By submitting, you agree to our processing of your technical data for service purposes. <br />
                        Response time is usually within <span className="text-white/60 font-bold">15-30 minutes</span> for urgent requests.
                      </p>
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
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                      <CheckCircle2 className="w-16 h-16 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full blur-2xl opacity-50 animate-pulse" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-5xl md:text-6xl font-display font-black mb-6 text-white"
                  >
                    Request Received
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg md:text-xl text-white/70 mb-16 max-w-lg mx-auto leading-relaxed"
                  >
                    Thank you. Our technical supervisor has been notified. We will contact you via phone shortly to confirm the intervention.
                  </motion.p>

                  {/* Premium Info Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="inline-block mb-16"
                  >
                    <div className="relative p-1 rounded-3xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
                      <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-[22px] border border-white/10 text-left min-w-[320px]">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center">
                            <Zap className="w-5 h-5 text-orange-400" />
                          </div>
                          <span className="font-bold text-sm uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                            Urgency Priority: High
                          </span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="text-white/50">Reference ID:</span>
                            <span className="ml-3 font-mono font-bold text-white bg-white/5 px-3 py-1 rounded-lg">{refId}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.button
                      onClick={() => window.location.href = '/'}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative inline-flex items-center gap-3 px-12 py-5 rounded-full font-bold text-lg"
                    >
                      <div className="absolute inset-0 backdrop-blur-xl bg-white/5 border border-white/10 rounded-full" />
                      <span className="relative z-10 text-white group-hover:text-white/90 transition-colors">
                        Return Home
                      </span>
                    </motion.button>
                  </motion.div>
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
              className="flex items-center gap-3 px-4 py-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-full"
            >
              <badge.icon className="w-4 h-4 text-white/40" />
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                {badge.text}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
