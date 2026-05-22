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

  // Reactive language detection that handles regional codes
  const currentLangCode = i18n.language || i18n.resolvedLanguage || 'fr';
  const currentLanguage = languages.find(
    (lang) => currentLangCode.startsWith(lang.code)
  ) || languages[0];

  const handleLanguageChange = async (langCode: string) => {
    if (currentLangCode.startsWith(langCode)) {
      setIsOpen(false);
      return;
    }

    try {
      // Set opening to false first for better UX
      setIsOpen(false);
      
      // Explicitly change language and await it
      await i18n.changeLanguage(langCode);
      
      // Force update document attributes for accessibility and SEO
      document.documentElement.lang = langCode;
      document.documentElement.setAttribute('lang', langCode);
      
      // Explicitly set localStorage as a manual backup to i18next detection
      localStorage.setItem('i18nextLng', langCode);
      
      console.log(`Language successfully changed to: ${langCode}`);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
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
        className="flex items-center gap-2 px-4 py-2 clip-angular-sm backdrop-blur-xl bg-bg-secondary border border-border-primary hover:border-brand-orange-primary/50 hover:bg-brand-orange-primary/10 hover:scale-105 active:scale-95 transition-all"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-4 h-4 text-brand-orange-primary" />
        <span className="text-sm font-bold">{currentLanguage.flag}</span>
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline text-text-primary">
          {currentLanguage.code}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && createPortal(
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed w-48 clip-angular-sm backdrop-blur-2xl bg-bg-primary/95 border border-border-primary shadow-2xl z-[1000] overflow-hidden"
            style={{
              top: coords.top > 0 ? `${coords.top}px` : '80px',
              right: coords.right > 0 ? `${coords.right}px` : '20px',
            }}
          >
            {languages.map((lang) => {
              const isSelected = currentLangCode.startsWith(lang.code);
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:translate-x-1',
                    isSelected
                      ? 'bg-brand-orange-primary/20 text-text-primary border-l-2 border-brand-orange-primary'
                      : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                  )}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{lang.label}</p>
                    <p className="text-[10px] uppercase tracking-widest text-text-tertiary">
                      {lang.code}
                    </p>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 clip-angular-sm bg-brand-orange-primary"
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
