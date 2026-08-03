import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const { user }                      = useAuth();
  const { i18n }                      = useTranslation();
  const navigate                      = useNavigate();
  const [stats, setStats]             = useState(null);
  const [nextMeeting, setNextMeeting] = useState(null);
  const [payments, setPayments]       = useState([]);
  const [loading, setLoading]         = useState(true);

  const t = (fr, en, wo) => {
    if (i18n.language === 'en') return en;
    if (i18n.language === 'wo') return wo;
    return fr;
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, meetingRes, paymentsRes] = await Promise.all([
        api.get('/members/stats'),
        api.get('/meetings/next'),
        api.get('/payments'),
      ]);
      setStats(statsRes.data.stats);
      setNextMeeting(meetingRes.data.meeting);
      setPayments(paymentsRes.data.payments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-CA', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const cotisationParMois = () => {
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû'];
    const data  = new Array(8).fill(0);
    payments.forEach(p => {
      const m = new Date(p.paymentDate).getMonth();
      if (m < 8) data[m] += p.amount;
    });
    const max = Math.max(...data, 1);
    return { mois, data, max };
  };

  const graph = cotisationParMois();

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ef', fontFamily: "'DM Sans', sans-serif" }}>

      {/* 🔑 Navbar partagée — hamburger, langue, déconnexion, lien mot de passe */}
      <Navbar />

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

        {/* BIENVENUE */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ color: '#1a3a6b', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>
            {t('Bonjour', 'Hello', 'Asalaa maalekum')}, {user?.firstName} 👋
          </h1>
          <p style={{ color: '#8a8a8a', marginTop: '0.25rem' }}>
            {t("Tableau de bord — Conseil d'Administration ACAFIS", "Dashboard — ACAFIS Board of Directors", "Bord — Conseil d'Administration ACAFIS")}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8a8a8a' }}>
            ⏳ {t('Chargement des données...', 'Loading data...', 'Soxor...')}
          </div>
        ) : (
          <>
            {/* STATS CARDS */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem', marginBottom: '1.5rem'
            }}>
              {[
                { label: t('Total Acquéreurs', 'Total Members', 'Yëgëlkat yi'),  value: stats?.total || 0,           icon: '👥', color: '#1a3a6b' },
                { label: t('Membres Actifs', 'Active Members', 'Xarit yi'),      value: stats?.actifs || 0,          icon: '✅', color: '#2d6a4f' },
                { label: t('À Jour', 'Up to Date', 'Yomb na'),                   value: stats?.aJour || 0,           icon: '💚', color: '#2d6a4f' },
                { label: t('En Retard', 'Late', 'Wëccef na'),                    value: stats?.enRetard || 0,        icon: '⚠️', color: '#c0392b' },
                { label: t('Total Collecté', 'Total Collected', 'Xaalis bi'),    value: `${(stats?.totalCollecte || 0).toLocaleString('fr-FR')} FCFA`, icon: '💰', color: '#c9973a' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: '#fff', borderRadius: '10px', padding: '1.25rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  borderLeft: `4px solid ${stat.color}`
                }}>
                  <div style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>{stat.icon}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: '0.78rem', color: '#8a8a8a', marginTop: '0.2rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* GRAPHIQUE COTISATIONS */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ color: '#1a3a6b', margin: '0 0 1.25rem', fontSize: '0.95rem', fontWeight: 700 }}>
                  📊 {t('Cotisations reçues par mois (2026)', 'Monthly contributions (2026)', 'Xaalis ji ci weer (2026)')}
                </h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px' }}>
                  {graph.mois.map((m, i) => {
                    const pct = (graph.data[i] / graph.max) * 100;
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{ fontSize: '0.62rem', color: '#1a3a6b', fontWeight: 700 }}>
                          {graph.data[i] > 0 ? `${(graph.data[i]/1000).toFixed(0)}k` : ''}
                        </div>
                        <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: '100px' }}>
                          <div style={{
                            width: '100%',
                            height: `${Math.max(pct, graph.data[i] > 0 ? 8 : 2)}%`,
                            background: graph.data[i] > 0 ? 'linear-gradient(180deg, #c9973a, #e8b86d)' : '#ede9e0',
                            borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease', minHeight: '3px'
                          }} />
                        </div>
                        <div style={{ fontSize: '0.62rem', color: '#8a8a8a' }}>{m}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #ede9e0', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', color: '#8a8a8a' }}>Total 2026</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2d6a4f' }}>
                    {graph.data.reduce((a, b) => a + b, 0).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
            </div>

            {/* CALENDRIER + BHS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ color: '#1a3a6b', margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 700 }}>
                  📅 {t('Calendrier des réunions', 'Meetings calendar', 'Réunion yi')}
                </h3>
                {nextMeeting ? (
                  <div>
                    <div style={{ background: '#1a3a6b', borderRadius: '10px', padding: '1rem', color: '#fff', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#c9973a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                        🔴 {t('Prochaine — AG Ordinaire', 'Next — Ordinary GA', 'Ci kanam — AG')}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{nextMeeting.title}</div>
                      <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>📅 {formatDate(nextMeeting.date)}</div>
                      <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>🕐 {nextMeeting.time} · {nextMeeting.duration} min</div>
                      <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>🔀 {nextMeeting.platform}</div>
                      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                        <a href={nextMeeting.meetingUrl} target="_blank" rel="noreferrer" style={{
                          background: '#c9973a', color: '#fff', padding: '0.35rem 0.75rem',
                          borderRadius: '6px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700
                        }}>💻 Jitsi</a>
                        {/* 🔑 navigate() au lieu de <a href> */}
                        <button onClick={() => navigate('/meetings')} style={{
                          background: 'rgba(255,255,255,0.15)', color: '#fff',
                          padding: '0.35rem 0.75rem', borderRadius: '6px', border: 'none',
                          cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'inherit',
                        }}>📋 {t('Détails', 'Details', 'Xëtu')}</button>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#8a8a8a', textAlign: 'center' }}>
                      📋 {nextMeeting.agenda?.length || 0} {t('points à l\'ordre du jour', 'agenda items', 'xët yi')}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#8a8a8a', padding: '1rem' }}>
                    {t('Aucune réunion planifiée', 'No meetings scheduled', 'Réunion amul')}
                  </div>
                )}
              </div>

              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ color: '#1a3a6b', margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 700 }}>
                  🏦 {t('Compte BHS — Solde actuel', 'BHS Account — Current balance', 'Konte BHS — Xaalis bi')}
                </h3>
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1a3a6b' }}>3 817 410</div>
                  <div style={{ fontSize: '0.88rem', color: '#c9973a', fontWeight: 700 }}>FCFA</div>
                  <div style={{ fontSize: '0.72rem', color: '#8a8a8a', marginTop: '0.25rem' }}>Au 13/07/2026</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {[
                    { label: t('Solde initial 01/01/2026', 'Initial balance 01/01/2026', 'Xaalis bu njëk'), value: '6 909 110 FCFA', color: '#1a3a6b' },
                    { label: t('Cotisations reçues', 'Contributions received', 'Xaalis jëm'),              value: '+ 920 200 FCFA', color: '#2d6a4f' },
                    { label: t('Dépenses architecture', 'Architecture expenses', 'Dépenses'),              value: '- 4 011 900 FCFA', color: '#c0392b' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: '#f8f5ef', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#666' }}>{item.label}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                {/* 🔑 navigate() au lieu de <a href> */}
                <button onClick={() => navigate('/payments')} style={{
                  display: 'block', width: '100%', textAlign: 'center', marginTop: '1rem',
                  background: '#1a3a6b', color: '#fff', padding: '0.6rem', border: 'none',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
                  fontFamily: 'inherit',
                }}>
                  💰 {t('Voir le détail financier', 'View financial details', 'Xool xaalis bi')}
                </button>
              </div>
            </div>

            {/* MODULES */}
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ color: '#1a3a6b', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
                {t('Modules disponibles', 'Available modules', 'Modul yi')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
                {[
                  { icon: '👥', label: t('Membres', 'Members', 'Xarit yi'),          sublabel: `${stats?.total || 0} acquéreurs`, path: '/members',        color: '#1a3a6b' },
                  { icon: '📅', label: t('Réunions', 'Meetings', 'Réunion yi'),       sublabel: 'CA & AG',       path: '/meetings',       color: '#2d6a4f' },
                  { icon: '💰', label: t('Finance', 'Finance', 'Xaalis bi'),          sublabel: 'BHS',           path: '/payments',       color: '#c9973a' },
                  { icon: '🗳️', label: t('Votes', 'Votes', 'Vote yi'),               sublabel: 'AG & CA',       path: '/votes',          color: '#4a1942' },
                  { icon: '📄', label: t('Documents', 'Documents', 'Papiye yi'),      sublabel: 'PV & rapports', path: '/documents',      color: '#023e8a' },
                  { icon: '🏗️', label: t('Projet Ndianda', 'Ndianda Project', 'Projet Ndianda'), sublabel: t('Avancement', 'Progress', 'Avancement'), path: '/project', color: '#2d6a4f' },
                ].map((mod, i) => (
                  // 🔑 navigate() au lieu de window.location.href — c'était la cause principale de la lenteur
                  <div key={i} onClick={() => navigate(mod.path)} style={{
                    background: '#fff', borderRadius: '10px', padding: '1rem',
                    cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    borderBottom: `3px solid ${mod.color}`, textAlign: 'center'
                  }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
                  >
                    <div style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>{mod.icon}</div>
                    <div style={{ fontWeight: 700, color: mod.color, fontSize: '0.82rem' }}>{mod.label}</div>
                    <div style={{ color: '#8a8a8a', fontSize: '0.7rem', marginTop: '0.15rem' }}>{mod.sublabel}</div>
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