import React from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Key, PenTool as Tool, Phone, Info, HelpCircle, MessageSquare, Car, Menu, X, ChevronRight, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

const navItems = [
  { name: 'services', href: '/services', icon: Tool },
  { name: 'brands', href: '/brands', icon: Car },
  { name: 'about', href: '/about', icon: Info },
  { name: 'contact', href: '/contact', icon: Phone },
];

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-4 px-4 sm:px-6 md:px-12',
        isScrolled ? 'py-3' : 'py-6'
      )}
    >
      {/* Industrial Navbar - Angular Design */}
      <nav className={cn(
        'max-w-7xl mx-auto flex items-center justify-between px-6 py-4 transition-all duration-500 relative overflow-visible',
        isScrolled ? 'glass-dark shadow-2xl' : 'glass'
      )}
      style={{
        clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
      }}
      >
        {/* Beveled corner overlays */}
        <div className="absolute top-0 left-0 w-6 h-6 bg-[var(--color-brand-orange-primary)] opacity-80" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
        <div className="absolute bottom-0 right-0 w-6 h-6 bg-[var(--color-brand-orange-primary)] opacity-80" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />

        {/* Logo - Hexagonal Design */}
        <Link to="/" className="flex items-center gap-3 group z-50">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12">
            {/* Hexagonal shape */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)] flex items-center justify-center group-hover:scale-110 transition-transform bg-glow-orange"
              style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }}
            >
              <Key className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-lg sm:text-xl tracking-tighter leading-none text-white">KEYPRO</span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[var(--color-brand-orange-primary)] leading-none mt-1 font-bold">Service Center</span>
          </div>
        </Link>

        {/* Desktop Nav - Industrial Style */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'relative px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all',
                location.pathname === item.href
                  ? 'text-[var(--color-brand-orange-primary)]'
                  : 'text-white/70 hover:text-white'
              )}
            >
              <span className="relative z-10">{t(`nav.${item.name}`)}</span>
              <AnimatePresence>
                {location.pathname === item.href && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-0 bg-[var(--color-brand-orange-primary)]/10 border border-[var(--color-brand-orange-primary)]/30"
                    style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </AnimatePresence>
            </Link>
          ))}
        </div>

        {/* CTA Button - Angular Design */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <AuthButtons />

          <Link
            to="/quote"
            className="hidden sm:block relative px-6 py-3 bg-gradient-to-r from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)] text-white text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 bg-glow-orange overflow-hidden group"
            style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
          >
            <span className="relative z-10">{t('nav.quote')}</span>
            <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
          </Link>

          {/* Mobile Menu Toggle - Square */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden z-50 p-2 glass border border-white/10"
            style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu - Industrial Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 glass-dark flex flex-col items-center justify-center p-8 pt-24"
          >
            <div className="flex flex-col items-center gap-6 w-full max-w-sm">
              {navItems.map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={item.href}
                  className="w-full"
                >
                  <Link
                    to={item.href}
                    className={cn(
                      "relative flex items-center justify-between p-5 glass border text-xl font-display font-black uppercase tracking-tight",
                      location.pathname === item.href
                        ? "bg-[var(--color-brand-orange-primary)]/10 border-[var(--color-brand-orange-primary)]/30 text-[var(--color-brand-orange-primary)]"
                        : "border-white/10 text-white"
                    )}
                    style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className="w-5 h-5" />
                      {t(`nav.${item.name}`)}
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-40" />
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full mt-4 space-y-4"
              >
                <Link
                  to="/quote"
                  className="block w-full py-5 bg-gradient-to-r from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)] text-white text-center font-black text-xl uppercase tracking-wider bg-glow-orange"
                  style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
                >
                  {t('nav.quote')}
                </Link>
                <div className="flex justify-center">
                  <LanguageSwitcher />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// Auth buttons component
function AuthButtons() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setShowUserMenu(false);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Link
          to="/login"
          className="hidden sm:block px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white transition-colors"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="hidden sm:block px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all"
          style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
        >
          Register
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="relative hidden sm:block">
        <button
          ref={buttonRef}
          onClick={() => navigate(user?.role === UserRole.ADMIN ? '/admin' : '/dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all"
          style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
        >
          <User className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {user?.firstName || 'Account'}
          </span>
          {user?.role === UserRole.ADMIN && (
            <Shield className="w-3 h-3 text-brand-red" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {showUserMenu && buttonRef.current && createPortal(
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed w-56 bg-[#0D0D0D] border border-white/20 shadow-2xl z-[100]"
            style={{
              clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
              top: `${buttonRef.current.getBoundingClientRect().bottom + 8}px`,
              right: `${window.innerWidth - buttonRef.current.getBoundingClientRect().right}px`,
            }}
          >
            <div className="p-4 border-b border-white/10">
              <p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-white/60">{user?.email}</p>
              {user?.role === UserRole.ADMIN && (
                <span className="inline-block mt-2 px-2 py-1 bg-brand-red/20 text-brand-red text-xs font-bold uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>

            <div className="p-2">
              <Link
                to={user?.role === UserRole.ADMIN ? '/admin' : '/dashboard'}
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded text-sm transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded text-sm transition-colors text-red-400"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
}

