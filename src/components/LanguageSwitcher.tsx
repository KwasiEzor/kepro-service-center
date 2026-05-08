import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 clip-angular-sm backdrop-blur-xl bg-white/5 border border-white/10 hover:border-[var(--color-brand-orange-primary)]/50 hover:bg-[var(--color-brand-orange-primary)]/10 transition-all"
      >
        <Globe className="w-4 h-4 text-[var(--color-brand-orange-primary)]" />
        <span className="text-sm font-bold">{currentLanguage.flag}</span>
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
          {currentLanguage.code}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 clip-angular-sm backdrop-blur-2xl bg-[var(--color-brand-gray)]/95 border border-white/10 shadow-2xl z-50 overflow-hidden"
          >
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                whileHover={{ x: 4 }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-all',
                  i18n.language === lang.code
                    ? 'bg-[var(--color-brand-orange-primary)]/20 text-white border-l-2 border-[var(--color-brand-orange-primary)]'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                )}
              >
                <span className="text-xl">{lang.flag}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold">{lang.label}</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/40">
                    {lang.code}
                  </p>
                </div>
                {i18n.language === lang.code && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 clip-angular-sm bg-[var(--color-brand-orange-primary)]"
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
