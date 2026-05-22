import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Logo } from '../../components/Logo';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';

type LoginForm = {
  email: string;
  password: string;
};

export default function Login() {
  const { t } = useTranslation();

  const loginSchema = z.object({
    email: z.string().email(t('auth.login.invalidEmail')),
    password: z.string().min(1, t('auth.login.passwordRequired')),
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    setIsLoading(true);

    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.login.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-6 py-12">
      {/* Language Switcher - Fixed top-right */}
      <div className="fixed top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <Logo className="justify-center mb-8" size="lg" />

        {/* Login Card */}
        <div className="card-dark p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('auth.login.title')}</h1>
            <p style={{ color: 'var(--color-text-tertiary)' }}>{t('auth.login.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                {t('auth.login.email')}
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-4 py-3 bg-bg-secondary border border-border-primary rounded-lg focus:border-brand-red focus:outline-none transition-colors"
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                {t('auth.login.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register('password')}
                  className="w-full px-4 py-3 pr-12 bg-bg-secondary border border-border-primary rounded-lg focus:border-brand-red focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-text-secondary transition-colors"
                  style={{ color: 'var(--color-text-tertiary)' }}
                  aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
              
              <div className="flex justify-end mt-2">
                <Link 
                  to="/forgot-password" 
                  className="text-xs font-bold uppercase tracking-widest text-text-tertiary hover:text-brand-red transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-brand-red hover:bg-brand-red/90 disabled:bg-brand-red/50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('auth.login.signingIn')}
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {t('auth.login.signIn')}
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm">
            <span style={{ color: 'var(--color-text-tertiary)' }}>{t('auth.login.noAccount')} </span>
            <Link to="/register" className="text-brand-red hover:underline font-medium">
              {t('auth.login.createAccount')}
            </Link>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm hover:text-text-primary transition-colors" style={{ color: 'var(--color-text-tertiary)' }}>
              ← {t('auth.login.backToHome')}
            </Link>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-primary)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--color-text-tertiary)' }}>{t('auth.login.demoCredentials')}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <strong>{t('auth.login.demoAdmin')}</strong> admin@keypro.service / Admin123!
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <strong>{t('auth.login.demoUser')}</strong> user@example.com / User123!
          </p>
        </div>
      </div>
    </div>
  );
}
