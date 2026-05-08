import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import fr from './locales/fr.json';

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources: {
      en: {
        translation: en,
      },
      fr: {
        translation: fr,
      },
    },
    fallbackLng: 'fr', // French as default (KeyPro is French-based)
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache language in localStorage
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
