import React from 'react';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  Linkedin
} from 'lucide-react';
import { cn } from '../lib/utils';
import { contactFormSchema, type ContactFormData } from '../lib/validation';

export default function Contact() {
  const [formState, setFormState] = React.useState<'idle' | 'submitting' | 'success'>('idle');

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
      const response = await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Submission failed');

      setFormState('success');
    } catch (error) {
      console.error('Form error:', error);
      alert('Failed to send. Please call us directly.');
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
              className="inline-flex items-center gap-2 px-6 py-2.5 clip-angular-sm bg-gradient-to-r from-[var(--color-brand-orange-primary)]/10 to-[var(--color-brand-orange-secondary)]/10 border border-white/10 text-xs font-bold tracking-widest uppercase mb-8 backdrop-blur-xl"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[var(--color-brand-orange-primary)]" />
              <span className="text-[var(--color-brand-orange-primary)]">
                Get in Touch
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-display font-black mb-8 leading-[1.05]">
              <span className="block text-white">Let's Talk</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)] animate-gradient">
                Binary.
              </span>
            </h1>

            <p className="text-xl text-white/70 leading-relaxed mb-16 max-w-lg">
              Whether it's an emergency lockout or a complex ECU programming question, our specialists are ready to <span className="text-white font-bold">decode your problem</span>.
            </p>

            {/* Premium Contact Cards */}
            <div className="space-y-6">
              {[
                { icon: Phone, label: "Emergency Hotline", value: "01 23 45 67 89", detail: "24/7 Rapid Response", gradient: "from-[var(--color-brand-orange-primary)]/20 to-[var(--color-brand-orange-secondary)]/20", iconColor: "text-[var(--color-brand-orange-primary)]" },
                { icon: Mail, label: "Technical Support", value: "support@keypro.service", detail: "Reply within 4 hours", gradient: "from-[var(--color-brand-orange-secondary)]/20 to-[var(--color-brand-orange-light)]/20", iconColor: "text-[var(--color-brand-orange-secondary)]" },
                { icon: MapPin, label: "Service Hub", value: "8 Rue de la Paix, Paris", detail: "Appointments Only", gradient: "from-[var(--color-brand-orange-primary)]/15 to-[var(--color-brand-orange-secondary)]/15", iconColor: "text-[var(--color-brand-orange-primary)]" }
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ x: 8, scale: 1.02 }}
                  className="group"
                >
                  <div className="relative p-1 clip-angular-md bg-gradient-to-br from-white/10 to-white/5">
                    <div className="flex gap-6 items-start p-6 backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02] rounded-[22px] border border-white/10">
                      <div className={cn(
                        "w-14 h-14 clip-angular-sm flex items-center justify-center bg-gradient-to-br transition-transform group-hover:scale-110 shadow-xl",
                        item.gradient
                      )}>
                        <item.icon className={cn("w-7 h-7", item.iconColor)} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                          {item.label}
                        </p>
                        <p className="text-lg md:text-xl font-bold mb-1 text-white transition-colors">
                          {item.value}
                        </p>
                        <p className="text-xs text-white/50">
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
                  className="w-12 h-12 backdrop-blur-xl bg-white/5 border border-white/10 clip-angular-sm flex items-center justify-center text-white/50 hover:text-white hover:border-[var(--color-brand-orange-primary)]/50 hover:bg-[var(--color-brand-orange-primary)]/10 transition-all"
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
            <div className="relative p-1 clip-angular-xl bg-gradient-to-br from-white/10 to-white/5">
              <div className="backdrop-blur-2xl bg-gradient-to-br from-[var(--color-brand-gray)]/80 to-[var(--color-brand-dark)]/80 p-8 md:p-12 clip-angular-lg border border-white/10 relative overflow-hidden">
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

                <h2 className="text-4xl font-display font-black mb-10 text-white relative z-10">
                  Send a Message
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
                    <h3 className="text-3xl font-display font-black mb-3 text-white">Message Sent</h3>
                    <p className="text-white/60 text-lg">One of our specialists will get back to you shortly.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/50 px-2">
                        Your Name
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        className="w-full backdrop-blur-xl bg-white/5 border border-white/10 clip-angular-sm py-4 px-6 focus:outline-none focus:border-[var(--color-brand-orange-primary)] focus:ring-2 focus:ring-[var(--color-brand-orange-primary)]/20 transition-all text-white placeholder:text-white/30"
                        placeholder="Jane Cooper"
                      />
                      {errors.name && (
                        <p className="text-red-400 text-xs px-2">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/50 px-2">
                        Email Address
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full backdrop-blur-xl bg-white/5 border border-white/10 clip-angular-sm py-4 px-6 focus:outline-none focus:border-[var(--color-brand-orange-primary)] focus:ring-2 focus:ring-[var(--color-brand-orange-primary)]/20 transition-all text-white placeholder:text-white/30"
                        placeholder="jane@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-400 text-xs px-2">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/50 px-2">
                        Message Topic
                      </label>
                      <select
                        {...register('topic')}
                        className="w-full backdrop-blur-xl bg-white/5 border border-white/10 clip-angular-sm py-4 px-6 focus:outline-none focus:border-[var(--color-brand-orange-primary)] focus:ring-2 focus:ring-[var(--color-brand-orange-primary)]/20 transition-all text-white appearance-none cursor-pointer"
                      >
                        <option className="bg-[var(--color-brand-gray)]">General Inquiry</option>
                        <option className="bg-[var(--color-brand-gray)]">Key Support</option>
                        <option className="bg-[var(--color-brand-gray)]">B2B Partnerships</option>
                        <option className="bg-[var(--color-brand-gray)]">Careers</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/50 px-2">
                        How can we help?
                      </label>
                      <textarea
                        {...register('message')}
                        rows={5}
                        className="w-full backdrop-blur-xl bg-white/5 border border-white/10 clip-angular-md py-4 px-6 focus:outline-none focus:border-[var(--color-brand-orange-primary)] focus:ring-2 focus:ring-[var(--color-brand-orange-primary)]/20 transition-all text-white placeholder:text-white/30 resize-none"
                        placeholder="Share some details about your problem..."
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
                          <span className="relative z-10 text-white">Processing</span>
                          <span className="relative z-10 w-5 h-5 border-2 border-white/20 border-t-white clip-angular-sm animate-spin" />
                        </>
                      ) : (
                        <>
                          <span className="relative z-10 text-white">SEND MESSAGE</span>
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
