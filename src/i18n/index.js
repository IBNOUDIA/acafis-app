import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './fr';
import en from './en';
import wo from './wo';

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    wo: { translation: wo },
  },
  lng: localStorage.getItem('acafis_lang') || 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
});

export default i18n;