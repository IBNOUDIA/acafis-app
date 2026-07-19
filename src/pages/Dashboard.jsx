import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { LOGO_NAV } from '../assets/logo';

export default function Dashboard() {
  const { user, logout }              = useAuth();
  const { i18n }                      = useTranslation();
  const [stats, setStats]             = useState(null);
  const [nextMeeting, setNextMeeting] = useState(null);
  const [members, setMembers]         = useState([]);
  const [payments, setPayments]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [countdown, setCountdown]     = useState({});

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('acafis_lang', lang);
  };

  const t = (fr, en, wo) => {
    if (i18n.language === 'en') return en;
    if (i18n.language === 'wo') return wo;
    return fr;
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const agDate = new Date('2026-08-01T14:00:00');
    const timer = setInterval(() => {
      const now  = new Date();
      const diff = agDate - now;
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }
      setCountdown({
        days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, meetingRes, membersRes, paymentsRes] = await Promise.all([
        api.get('/members/stats'),
        api.get('/meetings/next'),
        api.get('/members'),
        api.get('/payments'),
      ]);
      setStats(statsRes.data.stats);
      setNextMeeting(meetingRes.data.meeting);
      setMembers(membersRes.data.members || []);
      setPayments(paymentsRes.data.payments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
  const membresPresents = members.filter(m => m.notes === '').length;

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
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>
            {t('Gestion CA', 'CA Management', 'Jëfandikool CA')}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

          {/* 🌍 Sélecteur de langue */}
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {[
              { code: 'fr', flag: '🇫🇷', label: 'FR' },
              { code: 'en', flag: '🇬🇧', label: 'EN' },
              { code: 'wo', flag: '🇸🇳', label: 'WO' },
            ].map(lang => (
              <button key={lang.code} onClick={() => changeLang(lang.code)} style={{
                background: i18n.language === lang.code ? 'rgba(201,151,58,0.4)' : 'rgba(255,255,255,0.1)',
                border: i18n.language === lang.code ? '1px solid #c9973a' : '1px solid rgba(255,255,255,0.2)',
                color: '#fff', padding: '0.3rem 0.5rem', borderRadius: '6px',
                cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                transition: 'all 0.2s'
              }}>
                {lang.flag}
              </button>
            ))}
          </div>

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
            {t('Déconnexion', 'Logout', 'Dem')}
          </button>
        </div>
      </nav>

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
            {/* COMPTE À REBOURS */}
            <div style={{
              background: 'linear-gradient(135deg, #1a3a6b, #2e5090)',
              borderRadius: '16px', padding: '1.5rem 2rem',
              marginBottom: '1.5rem', color: '#fff',
              boxShadow: '0 8px 32px rgba(26,58,107,0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#c9973a', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    🔴 {t('Compte à rebours', 'Countdown', 'Yëgël')}
                  </div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                    {t('Assemblée Générale ACAFIS 2026', 'ACAFIS General Assembly 2026', 'Réunion Générale ACAFIS 2026')}
                  </h2>
                  <p style={{ margin: '0.3rem 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                    {t('1er août 2026 à 14h00 — Mode Hybride', 'August 1st, 2026 at 2:00 PM — Hybrid Mode', '1 Ut 2026 ci 14h00')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {[
                    { val: countdown.days,    label: t('Jours', 'Days', 'Fan') },
                    { val: countdown.hours,   label: t('Heures', 'Hours', 'Waxtu') },
                    { val: countdown.minutes, label: t('Minutes', 'Minutes', 'Simili') },
                    { val: countdown.seconds, label: t('Secondes', 'Seconds', 'Saa') },
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign: 'center', minWidth: '60px' }}>
                      <div style={{
                        background: 'rgba(255,255,255,0.15)', borderRadius: '10px',
                        padding: '0.5rem', fontSize: '1.8rem', fontWeight: 800, color: '#c9973a',
                        lineHeight: 1, minWidth: '60px'
                      }}>
                        {String(item.val).padStart(2, '0')}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {nextMeeting?.meetingUrl && (
                    <a href={nextMeeting.meetingUrl} target="_blank" rel="noreferrer" style={{
                      background: '#c9973a', color: '#fff', padding: '0.6rem 1.2rem',
                      borderRadius: '6px', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem'
                    }}>
                      🎥 {t('Rejoindre Jitsi', 'Join Jitsi', 'Dugg Jitsi')}
                    </a>
                  )}
                  <a href="/votes" style={{
                    background: 'rgba(255,255,255,0.15)', color: '#fff',
                    padding: '0.6rem 1.2rem', borderRadius: '6px',
                    textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}>
                    🗳️ {t('Votes en ligne', 'Online Votes', 'Vote yi')}
                  </a>
                </div>
              </div>
            </div>

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

            {/* GRAPHIQUE + STATUT MEMBRES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
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

              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ color: '#1a3a6b', margin: '0 0 1.25rem', fontSize: '0.95rem', fontWeight: 700 }}>
                  👥 {t('Statut membres — AG', 'Members status — GA', 'Xarit yi — AG')}
                </h3>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="48" fill="none" stroke="#ede9e0" strokeWidth="16" />
                      <circle cx="60" cy="60" r="48" fill="none" stroke="#2d6a4f" strokeWidth="16"
                        strokeDasharray={`${(membresPresents / 46) * 301} 301`}
                        strokeLinecap="round" transform="rotate(-90 60 60)" />
                      <circle cx="60" cy="60" r="48" fill="none" stroke="#c9973a" strokeWidth="16"
                        strokeDasharray={`${(10 / 46) * 301} 301`}
                        strokeLinecap="round"
                        strokeDashoffset={`-${(membresPresents / 46) * 301}`}
                        transform="rotate(-90 60 60)" />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a3a6b' }}>46</div>
                      <div style={{ fontSize: '0.6rem', color: '#8a8a8a' }}>{t('membres', 'members', 'xarit')}</div>
                    </div>
                  </div>
                </div>
                {[
                  { label: t('Présents AG', 'Present GA', 'Amoon na'),    value: membresPresents, color: '#2d6a4f', icon: '✅' },
                  { label: t('Procurations', 'Proxy', 'Procuration'),     value: 10,              color: '#c9973a', icon: '📋' },
                  { label: t('Absents', 'Absent', 'Amul'),                value: 11,              color: '#c0392b', icon: '❌' },
                  { label: t('Statut inconnu', 'Unknown', 'Xamul'),       value: 7,               color: '#8a8a8a', icon: '⬜' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: i < 3 ? '1px solid #f8f5ef' : 'none' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem' }}>{item.icon}</span>
                      <span style={{ fontSize: '0.82rem', color: '#333' }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: item.color }}>{item.value}</span>
                  </div>
                ))}
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
                        <a href="/meetings" style={{
                          background: 'rgba(255,255,255,0.15)', color: '#fff',
                          padding: '0.35rem 0.75rem', borderRadius: '6px',
                          textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700
                        }}>📋 {t('Détails', 'Details', 'Xëtu')}</a>
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
                <a href="/payments" style={{
                  display: 'block', textAlign: 'center', marginTop: '1rem',
                  background: '#1a3a6b', color: '#fff', padding: '0.6rem',
                  borderRadius: '8px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700
                }}>
                  💰 {t('Voir le détail financier', 'View financial details', 'Xool xaalis bi')}
                </a>
              </div>
            </div>

            {/* MODULES */}
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ color: '#1a3a6b', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
                {t('Modules disponibles', 'Available modules', 'Modul yi')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
                {[
                  { icon: '👥', label: t('Membres', 'Members', 'Xarit yi'),          sublabel: '46 acquéreurs', path: '/members',        color: '#1a3a6b' },
                  { icon: '📅', label: t('Réunions', 'Meetings', 'Réunion yi'),       sublabel: 'CA & AG',       path: '/meetings',       color: '#2d6a4f' },
                  { icon: '💰', label: t('Finance', 'Finance', 'Xaalis bi'),          sublabel: 'BHS',           path: '/payments',       color: '#c9973a' },
                  { icon: '🗳️', label: t('Votes', 'Votes', 'Vote yi'),               sublabel: 'AG & CA',       path: '/votes',          color: '#4a1942' },
                  { icon: '📄', label: t('Documents', 'Documents', 'Papiye yi'),      sublabel: 'PV & rapports', path: '/documents',      color: '#023e8a' },
                  { icon: '🏗️', label: t('Projet Ndianda', 'Ndianda Project', 'Projet Ndianda'), sublabel: t('Avancement', 'Progress', 'Avancement'), path: '/project', color: '#2d6a4f' },
                ].map((mod, i) => (
                  <div key={i} onClick={() => window.location.href = mod.path} style={{
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