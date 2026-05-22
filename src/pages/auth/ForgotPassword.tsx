import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { Logo } from '../../components/Logo';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', data);
      setSubmitted(true);
      toast.success('If an account exists with this email, a reset link has been sent.');
    } catch (error: any) {
      // Still show success to prevent email enumeration
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-brand-red/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-brand-red/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <Logo size="lg" className="justify-center mb-6" />
          <h1 className="text-3xl font-display font-black tracking-tighter text-text-primary uppercase italic">
            Forgot <span className="text-brand-red text-shadow-glow">Password?</span>
          </h1>
          <p className="text-text-tertiary mt-2 uppercase tracking-widest text-[10px] font-black">
            Enter your email to receive a reset link
          </p>
        </div>

        <div className="card-dark p-8 border border-border-primary/50 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-red scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
          
          {submitted ? (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-brand-red" />
              </div>
              <h2 className="text-xl font-bold text-text-primary uppercase italic">Check your inbox</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                If an account exists for <span className="text-text-primary font-bold">{submitted ? 'your email' : ''}</span>, 
                you will receive instructions to reset your password shortly.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-tertiary hover:text-brand-red transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="Enter your email"
                    className="w-full bg-bg-secondary border border-border-primary clip-angular-sm py-4 px-4 pl-12 text-text-primary focus:border-brand-red transition-all"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                </div>
                {errors.email && (
                  <p className="text-[10px] font-bold text-brand-red uppercase tracking-wider ml-2 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-brand-red font-black text-xl clip-angular-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-brand-red/20"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    SEND RESET LINK
                  </>
                )}
              </button>

              <div className="text-center pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-brand-red transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Remember your password? Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
