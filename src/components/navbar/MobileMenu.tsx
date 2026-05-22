import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeToggle } from '../ThemeToggle';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

export function MobileMenu({ isOpen, onClose, navItems }: MobileMenuProps) {
  const { t } = useTranslation();
  const location = useLocation();

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll when menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 backdrop-blur-sm z-40 bg-black/60"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Slide-in drawer from right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm z-50 overflow-y-auto bg-bg-primary"
          >
            {/* Drawer content */}
            <div className="flex flex-col h-full p-6 pt-24">
              {/* Nav items */}
              <nav className="flex flex-col gap-4">
                {navItems.map((item, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 + 0.1 }}
                    key={item.href}
                  >
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        'relative flex items-center justify-between p-4 text-base font-bold uppercase tracking-tight transition-all clip-angular-nav',
                        location.pathname === item.href
                          ? 'bg-brand-orange-primary/10 border-brand-orange-primary/30 text-brand-orange-primary'
                          : 'bg-bg-secondary border border-border-primary text-text-primary hover:bg-border-primary'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        {t(`nav.${item.name}`)}
                      </div>
                      <ChevronRight className="w-5 h-5 opacity-40" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* CTA Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 space-y-4"
              >
                <Link
                  to="/quote"
                  onClick={onClose}
                  className="block w-full py-4 bg-gradient-to-r from-brand-orange-primary to-brand-orange-secondary text-center font-black text-base uppercase tracking-wider bg-glow-orange clip-angular-nav transition-transform hover:scale-[1.02] active:scale-[0.98] text-white"
                >
                  {t('nav.quote')}
                </Link>

                {/* Theme and Language switchers */}
                <div className="flex justify-center items-center gap-3 pt-2">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>
              </motion.div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Footer info (optional) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="pt-6 mt-6 text-center text-xs border-t border-border-primary text-text-tertiary"
              >
                <p>{t('footer.copyright')}</p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
