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
        isScrolled ? 'py-4' : 'py-8'
      )}
    >
      <nav className={cn(
        'max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 rounded-2xl md:rounded-full transition-all duration-500',
        isScrolled ? 'glass-dark shadow-2xl scale-95 md:scale-100' : 'glass'
      )}>
        <Link to="/" className="flex items-center gap-2 group z-50">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-red rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform bg-glow-red">
            <Key className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg sm:text-xl tracking-tight leading-none">KEYPRO</span>
            <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-white/50 leading-none mt-1">Service Center</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-brand-red relative py-1',
                location.pathname === item.href ? 'text-white' : 'text-white/60'
              )}
            >
              {item.name}
              <AnimatePresence>
                {location.pathname === item.href && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-red"
                  />
                )}
              </AnimatePresence>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/quote"
            className="hidden sm:block bg-brand-red hover:bg-[#D42525] text-white px-6 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95 bg-glow-red"
          >
            Get a Quote
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden z-50 p-2 glass rounded-lg"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-40 glass-dark flex flex-col items-center justify-center p-8 pt-24"
          >
            <div className="flex flex-col items-center gap-8 w-full max-w-sm">
              {navItems.map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={item.href}
                  className="w-full"
                >
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center justify-between p-6 rounded-3xl glass border-white/5 text-2xl font-display font-bold",
                      location.pathname === item.href ? "bg-brand-red/10 border-brand-red/20 text-brand-red" : "text-white"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className="w-6 h-6 opacity-30" />
                      {item.name}
                    </div>
                    <ChevronRight className="w-6 h-6 opacity-20" />
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full px-6"
              >
                <Link
                  to="/quote"
                  className="block w-full py-6 bg-brand-red text-white text-center rounded-3xl font-black text-2xl bg-glow-red"
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
