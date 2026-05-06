import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Key, PenTool as Tool, Phone, Info, HelpCircle, MessageSquare, Car, Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { name: 'Services', href: '/services', icon: Tool },
  { name: 'Brands', href: '/brands', icon: Car },
  { name: 'About', href: '/about', icon: Info },
  { name: 'FAQ', href: '/faq', icon: HelpCircle },
  { name: 'Contact', href: '/contact', icon: Phone },
];

export default function Navbar() {
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
        'max-w-7xl mx-auto flex items-center justify-between px-6 py-4 transition-all duration-500 relative',
        isScrolled ? 'glass-dark shadow-2xl' : 'glass'
      )}
      style={{
        clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
      }}
      >
        {/* Beveled corner overlays */}
        <div className="absolute top-0 left-0 w-6 h-6 bg-[#FF6B2C] opacity-80" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
        <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#FF6B2C] opacity-80" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />

        {/* Logo - Hexagonal Design */}
        <Link to="/" className="flex items-center gap-3 group z-50">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12">
            {/* Hexagonal shape */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B2C] to-[#FF8C4D] flex items-center justify-center group-hover:scale-110 transition-transform bg-glow-orange"
              style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }}
            >
              <Key className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-lg sm:text-xl tracking-tighter leading-none text-white">KEYPRO</span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[#FF6B2C] leading-none mt-1 font-bold">Service Center</span>
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
                  ? 'text-[#FF6B2C]'
                  : 'text-white/70 hover:text-white'
              )}
            >
              <span className="relative z-10">{item.name}</span>
              <AnimatePresence>
                {location.pathname === item.href && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-0 bg-[#FF6B2C]/10 border border-[#FF6B2C]/30"
                    style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </AnimatePresence>
            </Link>
          ))}
        </div>

        {/* CTA Button - Angular Design */}
        <div className="flex items-center gap-4">
          <Link
            to="/quote"
            className="hidden sm:block relative px-6 py-3 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C4D] text-white text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 bg-glow-orange overflow-hidden group"
            style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
          >
            <span className="relative z-10">Get Quote</span>
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
                        ? "bg-[#FF6B2C]/10 border-[#FF6B2C]/30 text-[#FF6B2C]"
                        : "border-white/10 text-white"
                    )}
                    style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-40" />
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full mt-4"
              >
                <Link
                  to="/quote"
                  className="block w-full py-5 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C4D] text-white text-center font-black text-xl uppercase tracking-wider bg-glow-orange"
                  style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
                >
                  GET A QUOTE
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
