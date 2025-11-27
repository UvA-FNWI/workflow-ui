import { initReactI18next } from 'react-i18next';

import i18next from 'i18next';

// Import translations
import enCommon from './locales/en/common.json';
import nlCommon from './locales/nl/common.json';

export const defaultNS = 'common';
export const resources = {
  en: {
    common: enCommon,
  },
  nl: {
    common: nlCommon,
  },
} as const;

// Initialize i18next
if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    lng: 'en', // Default language
    fallbackLng: 'en',
    defaultNS,
    resources,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });
}

export default i18next;
