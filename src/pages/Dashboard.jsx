import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LOGO_NAV } from '../assets/logo';

export default function Dashboard() {
  const { user, logout }              = useAuth();
  const [stats, setStats]             = useState(null);
  const [nextMeeting, setNextMeeting] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, meetingRes] = await Promise.all([
          api.get('/members/stats'),
          api.get('/meetings/next'),
        ]);
        setStats(statsRes.data.stats);
        setNextMeeting(meetingRes.data.meeting);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-CA', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ef', fontFamily: "'DM Sans', sans-serif" }}>

      {/* NAVBAR */}
      <nav style={{
        background: '#1a3a6b', padding: '1rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={LOGO_NAV} alt="CoopACАFIS"
            style={{ height: '38px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>Gestion CA</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
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
            cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600
          }}>
            Déconnexion
          </button>
        </div>
      </nav>

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

        {/* BIENVENUE */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#1a3a6b', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>
            Bonjour, {user?.firstName} 👋
          </h1>
          <p style={{ color: '#8a8a8a', marginTop: '0.25rem' }}>
            Tableau de bord — Conseil d'Administration ACAFIS
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8a8a8a' }}>
            ⏳ Chargement des données...
          </div>
        ) : (
          <>
            {/* STATS CARDS */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem', marginBottom: '2rem'
            }}>
              {[
                { label: 'Total Acquéreurs', value: stats?.total || 0,           icon: '👥', color: '#1a3a6b' },
                { label: 'Membres Actifs',   value: stats?.actifs || 0,          icon: '✅', color: '#2d6a4f' },
                { label: 'À Jour',           value: stats?.aJour || 0,           icon: '💚', color: '#2d6a4f' },
                { label: 'En Retard',        value: stats?.enRetard || 0,        icon: '⚠️', color: '#c0392b' },
                { label: 'Total Collecté',   value: `${(stats?.totalCollecte || 0).toLocaleString()} FCFA`, icon: '💰', color: '#c9973a' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: '#fff', borderRadius: '10px', padding: '1.5rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  borderLeft: `4px solid ${stat.color}`
                }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: stat.color }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#8a8a8a', marginTop: '0.25rem' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* PROCHAINE RÉUNION */}
            {nextMeeting && (
              <div style={{
                background: '#1a3a6b', borderRadius: '12px', padding: '1.75rem',
                marginBottom: '2rem', color: '#fff',
                boxShadow: '0 4px 20px rgba(26,58,107,0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#c9973a', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      📅 Prochaine réunion
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
                      {nextMeeting.title}
                    </h2>
                    <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem' }}>
                      {formatDate(nextMeeting.date)} à {nextMeeting.time}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {nextMeeting.meetingUrl && (
                      <a href={nextMeeting.meetingUrl} target="_blank" rel="noreferrer" style={{
                        background: '#c9973a', color: '#fff', padding: '0.6rem 1.2rem',
                        borderRadius: '6px', textDecoration: 'none', fontWeight: 700,
                        fontSize: '0.82rem'
                      }}>
                        🎥 Rejoindre Jitsi
                      </a>
                    )}
                    <a href="/votes" style={{
                      background: 'rgba(255,255,255,0.15)', color: '#fff',
                      padding: '0.6rem 1.2rem', borderRadius: '6px',
                      textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}>
                      🗳️ Votes en ligne
                    </a>
                  </div>
                </div>
                {nextMeeting.agenda?.length > 0 && (
                  <div style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Ordre du jour
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {nextMeeting.agenda.slice(0, 4).map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.85rem' }}>
                          <span style={{ color: '#c9973a', fontWeight: 700, flexShrink: 0 }}>{item.order}.</span>
                          <span style={{ color: 'rgba(255,255,255,0.85)' }}>{item.title}</span>
                          {item.duration && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginLeft: 'auto', flexShrink: 0 }}>{item.duration} min</span>}
                        </div>
                      ))}
                      {nextMeeting.agenda.length > 4 && (
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                          +{nextMeeting.agenda.length - 4} autres points...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MENU MODULES */}
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ color: '#1a3a6b', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                Modules disponibles
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                {[
                  { icon: '👥', label: 'Membres',        sublabel: '46 acquéreurs', path: '/members',        color: '#1a3a6b' },
                  { icon: '📅', label: 'Réunions',       sublabel: 'CA & AG',       path: '/meetings',       color: '#2d6a4f' },
                  { icon: '💰', label: 'Finance',        sublabel: 'Cotisations',   path: '/payments',       color: '#c9973a' },
                  { icon: '🗳️', label: 'Votes',          sublabel: 'AG & CA',       path: '/votes',          color: '#4a1942' },
                  { icon: '📄', label: 'Documents',      sublabel: 'PV & rapports', path: '/documents',      color: '#023e8a' },
                  { icon: '🏗️', label: 'Projet Ndianda', sublabel: 'Avancement',   path: '/project',        color: '#2d6a4f' },
                ].map((mod, i) => (
                  <div key={i} onClick={() => window.location.href = mod.path} style={{
                    background: '#fff', borderRadius: '10px', padding: '1.25rem',
                    cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    borderBottom: `3px solid ${mod.color}`, textAlign: 'center'
                  }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
                  >
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{mod.icon}</div>
                    <div style={{ fontWeight: 700, color: mod.color, fontSize: '0.88rem' }}>{mod.label}</div>
                    <div style={{ color: '#8a8a8a', fontSize: '0.75rem', marginTop: '0.2rem' }}>{mod.sublabel}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}