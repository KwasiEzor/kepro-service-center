import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Loader2, KeyRound, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { Logo } from '../../components/Logo';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain one uppercase letter')
    .regex(/[0-9]/, 'Must contain one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Missing reset token');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', {
        token,
        password: data.password,
      });
      toast.success('Password reset successful! You can now log in.');
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Invalid or expired token';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
        <div className="text-center">
          <KeyRound className="w-16 h-16 text-brand-red mx-auto mb-6 opacity-20" />
          <h1 className="text-2xl font-bold mb-4">Invalid Reset Link</h1>
          <p className="text-text-tertiary mb-8">This password reset link is missing or malformed.</p>
          <Link to="/forgot-password" class="text-brand-red font-bold uppercase tracking-widest text-xs">Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 relative overflow-hidden">
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
            Reset <span className="text-brand-red text-shadow-glow">Password</span>
          </h1>
          <p className="text-text-tertiary mt-2 uppercase tracking-widest text-[10px] font-black">
            Choose a new secure password
          </p>
        </div>

        <div className="card-dark p-8 border border-border-primary/50">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-2">
                New Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-bg-secondary border border-border-primary clip-angular-sm py-4 px-4 pl-12 text-text-primary focus:border-brand-red transition-all"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] font-bold text-brand-red uppercase tracking-wider ml-2 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-bg-secondary border border-border-primary clip-angular-sm py-4 px-4 pl-12 text-text-primary focus:border-brand-red transition-all"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              </div>
              {errors.confirmPassword && (
                <p className="text-[10px] font-bold text-brand-red uppercase tracking-wider ml-2 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-brand-red font-black text-xl clip-angular-sm flex items-center justify-center gap-3 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-6 h-6" />
                  UPDATE PASSWORD
                </>
              )}
            </button>
            
            <div className="text-center pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-brand-red transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Cancel and return to login
                </Link>
              </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
