import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import { cn } from '../../lib/utils';

export function AuthButtons() {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Link
          to="/login"
          className="hidden sm:block px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white transition-colors"
        >
          {t('common.login')}
        </Link>
        <Link
          to="/register"
          className="hidden sm:block px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all clip-angular-2xs"
        >
          {t('common.register')}
        </Link>
      </>
    );
  }

  return (
    <div className="hidden sm:block">
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all clip-angular-2xs"
            aria-label={t('common.account')}
          >
            <User className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {user?.firstName || t('common.account')}
            </span>
            {user?.role === UserRole.ADMIN && (
              <Shield className="w-3 h-3 text-[var(--color-brand-orange-primary)] shadow-[0_0_10px_var(--color-brand-orange-primary)]" />
            )}
          </button>
        </DropdownMenu.Trigger>

        <AnimatePresence>
          {open && (
            <DropdownMenu.Portal forceMount>
              <DropdownMenu.Content
                asChild
                align="end"
                sideOffset={12}
                className="z-[1000]"
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="w-56 bg-[var(--color-brand-dark)] border border-white/20 shadow-2xl clip-angular-sm"
                >
                  {/* User Info Header */}
                  <div className="p-4 border-b border-white/10">
                    <p className="text-sm font-semibold">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-white/60">{user?.email}</p>
                    {user?.role === UserRole.ADMIN && (
                      <span className="inline-block mt-2 px-2 py-1 bg-[var(--color-brand-orange-primary)]/20 text-[var(--color-brand-orange-primary)] text-xs font-bold uppercase tracking-wider">
                        {t('common.admin')}
                      </span>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <DropdownMenu.Item asChild>
                      <Link
                        to={user?.role === UserRole.ADMIN ? '/admin' : '/dashboard'}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors outline-none",
                          "hover:bg-white/10 focus:bg-white/10"
                        )}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {t('common.dashboard')}
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item asChild>
                      <button
                        onClick={handleLogout}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors outline-none",
                          "hover:bg-white/10 focus:bg-white/10 text-orange-400"
                        )}
                      >
                        <LogOut className="w-4 h-4" />
                        {t('common.logout')}
                      </button>
                    </DropdownMenu.Item>
                  </div>
                </motion.div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          )}
        </AnimatePresence>
      </DropdownMenu.Root>
    </div>
  );
}
