import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  // More robust language matching that handles regional codes (en-US, fr-FR)
  const currentLanguage = languages.find(
    (lang) => i18n.language?.startsWith(lang.code) || i18n.resolvedLanguage?.startsWith(lang.code)
  ) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  // Update position coordinates
  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 12,
        right: window.innerWidth - rect.right,
      });
    }
  };

  // Update position when opening or when window resizes/scrolls
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        buttonRef.current &&
        dropdownRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 clip-angular-sm backdrop-blur-xl bg-white/5 border border-white/10 hover:border-[var(--color-brand-orange-primary)]/50 hover:bg-[var(--color-brand-orange-primary)]/10 hover:scale-105 active:scale-95 transition-all"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-4 h-4 text-[var(--color-brand-orange-primary)]" />
        <span className="text-sm font-bold">{currentLanguage.flag}</span>
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
          {currentLanguage.code}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && buttonRef.current && createPortal(
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed w-48 clip-angular-sm backdrop-blur-2xl bg-[var(--color-brand-gray)]/95 border border-white/10 shadow-2xl z-[1000] overflow-hidden"
            style={{
              top: `${coords.top}px`,
              right: `${coords.right}px`,
            }}
          >
            {languages.map((lang) => {
              const isSelected = i18n.language?.startsWith(lang.code) || i18n.resolvedLanguage?.startsWith(lang.code);
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:translate-x-1',
                    isSelected
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
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 clip-angular-sm bg-[var(--color-brand-orange-primary)]"
                    />
                  )}
                </button>
              );
            })}
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
}
