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
    supportedLngs: ['en', 'fr'],
    fallbackLng: 'fr', // French as default (KeyPro is French-based)
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    debug: true, // Enable for better troubleshooting
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false, // Disable suspense to prevent app-level rendering blocks
    },
    detection: {
      // Order of language detection
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      // Cache language in localStorage and cookie
      caches: ['localStorage', 'cookie'],
      lookupLocalStorage: 'i18nextLng',
      lookupCookie: 'i18next',
      cookieMinutes: 10080, // 7 days
    },
  });

export default i18n;
