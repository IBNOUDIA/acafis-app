import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LOGO_NAV } from '../assets/logo';

// Liens du menu — un seul endroit à modifier si un module est ajouté/retiré
const MENU_ITEMS = [
  { path: '/dashboard', icon: '🏠', label: { fr: 'Tableau de bord', en: 'Dashboard', wo: 'Kër' } },
  { path: '/members',   icon: '👥', label: { fr: 'Membres',        en: 'Members',   wo: 'Xarit yi' } },
  { path: '/meetings',  icon: '📅', label: { fr: 'Réunions',       en: 'Meetings',  wo: 'Réunion yi' } },
  { path: '/payments',  icon: '💰', label: { fr: 'Finance',        en: 'Finance',   wo: 'Xaalis bi' } },
  { path: '/votes',     icon: '🗳️', label: { fr: 'Votes',          en: 'Votes',     wo: 'Vote yi' } },
  { path: '/sondages',  icon: '📊', label: { fr: 'Sondages',       en: 'Polls',     wo: 'Sondage yi' } },
  { path: '/documents', icon: '📄', label: { fr: 'Documents',      en: 'Documents', wo: 'Papiye yi' } },
  { path: '/project',   icon: '🏗️', label: { fr: 'Projet Ndianda', en: 'Ndianda Project', wo: 'Projet Ndianda' } },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('acafis_lang', lang);
  };

  const t = (fr, en, wo) => {
    if (i18n.language === 'en') return en;
    if (i18n.language === 'wo') return wo;
    return fr;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <nav style={{
        background: '#1a3a6b', padding: '1rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)', position: 'relative', zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            style={{
              background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px',
              width: '38px', height: '38px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '4px',
            }}
          >
            <span style={{ width: '20px', height: '2px', background: '#fff', transition: 'transform 0.2s', transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
            <span style={{ width: '20px', height: '2px', background: '#fff', opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
            <span style={{ width: '20px', height: '2px', background: '#fff', transition: 'transform 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
          </button>

          <img src={LOGO_NAV} alt="CoopACAFIS"
            style={{ height: '32px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {[
              { code: 'fr', flag: '🇫🇷' },
              { code: 'en', flag: '🇬🇧' },
              { code: 'wo', flag: '🇸🇳' },
            ].map(lang => (
              <button key={lang.code} onClick={() => changeLang(lang.code)} style={{
                background: i18n.language === lang.code ? 'rgba(201,151,58,0.4)' : 'rgba(255,255,255,0.1)',
                border: i18n.language === lang.code ? '1px solid #c9973a' : '1px solid rgba(255,255,255,0.2)',
                color: '#fff', padding: '0.3rem 0.5rem', borderRadius: '6px',
                cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
              }}>
                {lang.flag}
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'right', display: window.innerWidth < 640 ? 'none' : 'block' }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>
              {user?.position || user?.role}
            </div>
          </div>
          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', padding: '0.4rem 0.9rem', borderRadius: '6px',
            cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
          }}>
            {t('Déconnexion', 'Logout', 'Dem')}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 98 }}
          />
          <div style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px',
            background: '#fff', zIndex: 99, boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
            padding: '5rem 0 1rem', overflowY: 'auto',
          }}>
            {MENU_ITEMS.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => goTo(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    width: '100%', padding: '0.85rem 1.5rem', border: 'none',
                    background: active ? '#f8f5ef' : 'transparent',
                    borderLeft: active ? '4px solid #c9973a' : '4px solid transparent',
                    cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem',
                    fontWeight: active ? 700 : 500, color: active ? '#1a3a6b' : '#333',
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                  {t(item.label.fr, item.label.en, item.label.wo)}
                </button>
              );
            })}

            <button
              onClick={() => goTo('/profile/password')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                width: '100%', padding: '0.85rem 1.5rem', border: 'none',
                background: 'transparent', borderTop: '1px solid #ede9e0', marginTop: '0.5rem',
                cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem', color: '#333',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🔒</span>
              {t('Changer mon mot de passe', 'Change my password', 'Soppi mot de passe')}
            </button>
          </div>
        </>
      )}
    </>
  );
}