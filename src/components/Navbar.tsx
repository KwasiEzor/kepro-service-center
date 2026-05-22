import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool as Tool, Phone, Info, Car, Menu, X, Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { AuthButtons } from './navbar/AuthButtons';
import { MobileMenu } from './navbar/MobileMenu';

const navItems = [
  { name: 'services', href: '/services', icon: Tool },
  { name: 'gallery', href: '/gallery', icon: Camera },
  { name: 'brands', href: '/brands', icon: Car },
  { name: 'about', href: '/about', icon: Info },
  { name: 'contact', href: '/contact', icon: Phone },
];

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Handle scroll state
  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-4 px-4 sm:px-6 md:px-12 overflow-visible',
          (isScrolled || isMobileMenuOpen) ? 'py-3' : 'py-6'
        )}
      >
        {/* Main Navigation Container */}
        <nav
          className={cn(
            'max-w-7xl mx-auto flex items-center justify-between px-6 py-4 transition-all duration-500 relative overflow-visible z-50 clip-angular-lg',
            (isScrolled || isMobileMenuOpen) ? 'glass-dark shadow-2xl' : 'glass'
          )}
        >
          {/* Decorative beveled corner overlays */}
          <div className="absolute top-0 left-0 w-6 h-6 bg-brand-orange-primary opacity-80" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-brand-orange-primary opacity-80" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />

          {/* Logo */}
          <Logo className="relative z-50" size="md" />

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'relative px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all',
                  location.pathname === item.href
                    ? 'text-brand-orange-primary'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                <span className="relative z-10">{t(`nav.${item.name}`)}</span>
                <AnimatePresence>
                  {location.pathname === item.href && (
                    <motion.div
                      layoutId="nav-active-bg"
                      className="absolute inset-0 bg-brand-orange-primary/10 border border-brand-orange-primary/30 clip-angular-xs"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </AnimatePresence>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher />
            <AuthButtons />

            {/* Quote CTA Button - Desktop */}
            <Link
              to="/quote"
              className="hidden sm:block relative px-6 py-3 bg-gradient-to-r from-brand-orange-primary to-brand-orange-secondary text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 bg-glow-orange overflow-hidden group clip-angular-sm text-white"
            >
              <span className="relative z-10">{t('nav.quote')}</span>
              <div className="absolute inset-0 translate-x-full group-hover:translate-x-0 transition-transform duration-300 bg-white/20" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative z-50 p-2 glass clip-angular-2xs transition-all active:scale-95 border border-border-primary"
              aria-label={isMobileMenuOpen ? t('common.close') : t('common.open')}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Component */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={navItems}
      />
    </>
  );
}
