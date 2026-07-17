import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './i18n/index.js';
const { t, i18n } = useTranslation();

const changeLang = (lang) => {
  i18n.changeLanguage(lang);
  localStorage.setItem('acafis_lang', lang);
};
{/* Sélecteur langue */}
<div style={{ display: 'flex', gap: '0.25rem' }}>
  {[
    { code: 'fr', flag: '🇫🇷' },
    { code: 'en', flag: '🇬🇧' },
    { code: 'wo', flag: '🇸🇳' },
  ].map(lang => (
    <button key={lang.code} onClick={() => changeLang(lang.code)} style={{
      background: i18n.language === lang.code ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      color: '#fff', padding: '0.3rem 0.5rem', borderRadius: '6px',
      cursor: 'pointer', fontSize: '1rem'
    }}>
      {lang.flag}
    </button>
  ))}
</div>

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
  
)
