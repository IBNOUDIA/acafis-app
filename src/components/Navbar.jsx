import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LOGO_NAV } from '../assets/logo';

// Liens du menu — un seul endroit à modifier si un module est ajouté/retiré
const MENU_ITEMS = [
  { path: '/dashboard',  icon: '🏠', label: { fr: 'Tableau de bord', en: 'Dashboard', wo: 'Kër' } },
  { path: '/mon-compte', icon: '💳', label: { fr: 'Mon compte',      en: 'My account', wo: 'Sama compte' } },
  { path: '/members',   icon: '👥', label: { fr: 'Membres',        en: 'Members',   wo: 'Xarit yi' } },
  { path: '/meetings',  icon: '📅', label: { fr: 'Réunions',       en: 'Meetings',  wo: 'Réunion yi' } },
  { path: '/payments',  icon: '💰', label: { fr: 'Finance',        en: 'Finance',   wo: 'Xaalis bi' } },
  { path: '/votes',     icon: '🗳️', label: { fr: 'Votes',          en: 'Votes',     wo: 'Vote yi' } },
  { path: '/sondages',  icon: '📊', label: { fr: 'Sondages',       en: 'Polls',     wo: 'Sondage yi' } },
  { path: '/communications', icon: '📢', label: { fr: 'Communications', en: 'Communications', wo: 'Communications' } },
  { path: '/documents', icon: '📄', label: { fr: 'Documents',      en: 'Documents', wo: 'Papiye yi' } },
  { path: '/project',   icon: '🏗️', label: { fr: 'Projet Ndianda', en: 'Ndianda Project', wo: 'Projet Ndianda' } },
  { path: '/bureau',    icon: '🏛️', label: { fr: 'Bureau',          en: 'Board',     wo: 'Bureau bi' } },
  { path: '/suivi',     icon: '📊', label: { fr: 'Suivi',           en: 'Progress',  wo: 'Suivi' } },
  { path: '#',          icon: '🛍️', label: { fr: 'Boutique',        en: 'Shop',      wo: 'Boutik' }, comingSoon: true },
];

const FLAGS = [
  { code: 'fr', flag: '🇫🇷' },
  { code: 'en', flag: '🇬🇧' },
  { code: 'wo', flag: '🇸🇳' },
];

// 🔑 Nouveau — hook pour suivre la largeur d'écran en temps réel (rotation/redimensionnement)
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < breakpoint
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false); // 🔑 nouveau
  const isMobile = useIsMobile(640); // 🔑 nouveau — réactif au resize

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('acafis_lang', lang);
    setLangMenuOpen(false);
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

  const currentFlag = FLAGS.find(l => l.code === i18n.language) || FLAGS[0];

  return (
    <>
      <nav style={{
        background: '#1a3a6b', padding: isMobile ? '0.7rem 0.85rem' : '1rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)', position: 'relative', zIndex: 100,
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '0.75rem', minWidth: 0 }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            style={{
              background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px',
              width: '40px', height: '40px', cursor: 'pointer', flexShrink: 0,
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '4px',
            }}
          >
            <span style={{ width: '20px', height: '2px', background: '#fff', transition: 'transform 0.2s', transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
            <span style={{ width: '20px', height: '2px', background: '#fff', opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
            <span style={{ width: '20px', height: '2px', background: '#fff', transition: 'transform 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
          </button>

          <img src={LOGO_NAV} alt="CoopACAFIS"
            style={{ height: isMobile ? '26px' : '32px', objectFit: 'contain', filter: 'brightness(0) invert(1)', flexShrink: 1, minWidth: 0 }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1rem', flexShrink: 0 }}>
          {/* 🔑 Sur mobile : un seul drapeau (langue actuelle) qui ouvre un petit menu déroulant */}
          {isMobile ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setLangMenuOpen(!langMenuOpen)} style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', padding: '0.4rem 0.55rem', borderRadius: '6px',
                cursor: 'pointer', fontSize: '0.95rem', lineHeight: 1,
              }}>
                {currentFlag.flag}
              </button>
              {langMenuOpen && (
                <>
                  <div onClick={() => setLangMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 149 }} />
                  <div style={{
                    position: 'absolute', top: '110%', right: 0, background: '#fff',
                    borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                    zIndex: 150, overflow: 'hidden', minWidth: '52px',
                  }}>
                    {FLAGS.map(lang => (
                      <button key={lang.code} onClick={() => changeLang(lang.code)} style={{
                        display: 'block', width: '100%', background: lang.code === i18n.language ? '#f8f5ef' : '#fff',
                        border: 'none', padding: '0.55rem 0.75rem', cursor: 'pointer', fontSize: '1.1rem', textAlign: 'left',
                      }}>
                        {lang.flag}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {FLAGS.map(lang => (
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
          )}

          {/* Nom/poste masqué sur mobile — géré par le hook réactif désormais */}
          {!isMobile && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>
                {user?.position || user?.role}
              </div>
            </div>
          )}

          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', padding: isMobile ? '0.4rem 0.6rem' : '0.4rem 0.9rem', borderRadius: '6px',
            cursor: 'pointer', fontSize: isMobile ? '0.72rem' : '0.78rem', fontWeight: 600, whiteSpace: 'nowrap',
          }}>
            {isMobile ? '⏻' : t('Déconnexion', 'Logout', 'Dem')}
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
            position: 'fixed', top: 0, left: 0, bottom: 0,
            width: isMobile ? 'min(82vw, 280px)' : '280px',
            background: '#fff', zIndex: 99, boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
            display: 'flex', flexDirection: 'column', // 🔑 overflowY retiré d'ici
          }}>
            {/* En-tête du tiroir avec bouton de fermeture explicite */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.1rem 1.25rem', borderBottom: '1px solid #ede9e0', flexShrink: 0,
            }}>
              <img src={LOGO_NAV} alt="CoopACAFIS" style={{ height: '28px', objectFit: 'contain' }} />
              <button onClick={() => setMenuOpen(false)} aria-label="Fermer" style={{
                background: '#f8f5ef', border: 'none', borderRadius: '50%',
                width: '34px', height: '34px', cursor: 'pointer', fontSize: '1rem', color: '#666', flexShrink: 0,
              }}>✕</button>
            </div>

            {/* 🔑 flex:1 + minHeight:0 + overflowY ICI — c'est ce qui manquait pour que le scroll fonctionne */}
            <div style={{ padding: '0.5rem 0', flex: 1, minHeight: 0, overflowY: 'auto' }}>
              {MENU_ITEMS.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => item.comingSoon
                      ? alert(t('Boutique ACAFIS — bientôt disponible !', 'ACAFIS Shop — coming soon!', 'Boutik ACAFIS — bientôt !'))
                      : goTo(item.path)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      width: '100%', padding: '0.95rem 1.5rem', border: 'none', // 🔑 zone tactile agrandie
                      background: active ? '#f8f5ef' : 'transparent',
                      borderLeft: active ? '4px solid #c9973a' : '4px solid transparent',
                      cursor: 'pointer', textAlign: 'left', fontSize: '0.92rem',
                      fontWeight: active ? 700 : 500, color: active ? '#1a3a6b' : '#333',
                    }}
                  >
                    <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{item.icon}</span>
                    {t(item.label.fr, item.label.en, item.label.wo)}
                    {item.comingSoon && (
                      <span style={{
                        marginLeft: 'auto', fontSize: '0.62rem', fontWeight: 700, color: '#c9973a',
                        background: '#fdf5e6', padding: '0.15rem 0.5rem', borderRadius: '10px',
                      }}>
                        {t('Bientôt', 'Soon', 'Bientôt')}
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                onClick={() => goTo('/profile/password')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  width: '100%', padding: '0.95rem 1.5rem', border: 'none',
                  background: 'transparent', borderTop: '1px solid #ede9e0', marginTop: '0.5rem',
                  cursor: 'pointer', textAlign: 'left', fontSize: '0.92rem', color: '#333',
                }}
              >
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>🔒</span>
                {t('Changer mon mot de passe', 'Change my password', 'Soppi mot de passe')}
              </button>

              <a
                href="https://coop-acafis.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  width: '100%', padding: '0.95rem 1.5rem', border: 'none',
                  background: 'transparent', textDecoration: 'none',
                  cursor: 'pointer', textAlign: 'left', fontSize: '0.92rem', color: '#333',
                }}
              >
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>🌐</span>
                {t('Site web de la coopérative', 'Cooperative website', 'Site web bi')}
              </a>
            </div>

            {/* 🔑 Déconnexion accessible directement dans le tiroir sur mobile (le bouton du header devient une icône) */}
            {isMobile && (
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  width: '100%', padding: '0.95rem 1.5rem', border: 'none',
                  background: '#fdf0ee', borderTop: '1px solid #ede9e0',
                  cursor: 'pointer', textAlign: 'left', fontSize: '0.92rem', color: '#c0392b', fontWeight: 600, flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>⏻</span>
                {t('Déconnexion', 'Logout', 'Dem')}
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
}