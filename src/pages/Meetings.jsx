import { useState, useEffect } from 'react';
import api from '../services/api';
import { LOGO_NAV } from '../assets/logo';

export default function Meetings() {
  const [meetings, setMeetings]       = useState([]);
  const [nextMeeting, setNextMeeting] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('next');
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState({
    title: '', type: 'ag_ordinaire', date: '', time: '',
    duration: 120, meetingUrl: '', location: '', mode: 'hybride'
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [nextRes, allRes] = await Promise.all([
        api.get('/meetings/next'),
        api.get('/meetings'),
      ]);
      setNextMeeting(nextRes.data.meeting);
      setMeetings(allRes.data.meetings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const jitsiUrl = `https://meet.jit.si/ACAFIS-${form.type.toUpperCase()}-${Date.now()}`;
      await api.post('/meetings', {
        ...form,
        meetingUrl: form.meetingUrl || jitsiUrl,
        platform: form.mode === 'online' ? 'Jitsi Meet' :
                  form.mode === 'presentiel' ? 'Présentiel' : 'Hybride (Jitsi + Présentiel)',
      });
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const modeIcon = (platform) => {
    if (platform?.includes('Hybride')) return '🔀';
    if (platform?.includes('Jitsi') || platform?.includes('online')) return '💻';
    return '🏛️';
  };

  const typeLabel = {
    ca_ordinaire:      'CA Ordinaire',
    ca_extraordinaire: 'CA Extraordinaire',
    ag_ordinaire:      'AG Ordinaire',
    ag_extraordinaire: 'AG Extraordinaire',
    commission:        'Commission',
  };

  const statusColor = {
    planifiée: '#1a3a6b',
    en_cours:  '#2d6a4f',
    terminée:  '#8a8a8a',
    annulée:   '#c0392b',
    reportée:  '#c9973a',
  };

  const tabs = [
    { id: 'next', label: '📅 Prochaine' },
    { id: 'all',  label: '📋 Toutes les réunions' },
    { id: 'ag',   label: '🏛️ AG 1er août' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ef', fontFamily: "'DM Sans', sans-serif" }}>

      {/* NAVBAR */}
      <nav style={{ background: '#1a3a6b', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={LOGO_NAV} alt="CoopACАFIS"
            style={{ height: '38px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>Module Réunions</div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => setShowForm(true)} style={{
            background: '#c9973a', color: '#fff', border: 'none',
            padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.82rem'
          }}>
            + Nouvelle réunion
          </button>
          <a href="/dashboard" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.82rem' }}>
            ← Dashboard
          </a>
        </div>
      </nav>

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ color: '#1a3a6b', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>📅 Réunions CA & AG</h1>
          <p style={{ color: '#8a8a8a', marginTop: '0.25rem' }}>Mode hybride — Présentiel + Jitsi Meet</p>
        </div>

        {/* ONGLETS */}
        <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '2px solid #ede9e0' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0.75rem 1.25rem', fontSize: '0.82rem', fontWeight: 600,
              color: activeTab === tab.id ? '#1a3a6b' : '#8a8a8a',
              borderBottom: activeTab === tab.id ? '3px solid #c9973a' : '3px solid transparent',
              marginBottom: '-2px'
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8a8a8a' }}>⏳ Chargement...</div>
        ) : (
          <>
            {/* PROCHAINE RÉUNION */}
            {activeTab === 'next' && nextMeeting && (
              <div>
                <div style={{
                  background: '#1a3a6b', borderRadius: '16px', padding: '2rem',
                  marginBottom: '1.5rem', color: '#fff',
                  boxShadow: '0 8px 32px rgba(26,58,107,0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#c9973a', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        🔴 Prochaine réunion — {typeLabel[nextMeeting.type]}
                      </div>
                      <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{nextMeeting.title}</h2>
                      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem' }}>📅 {formatDate(nextMeeting.date)}</span>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem' }}>🕐 {nextMeeting.time} ({nextMeeting.duration} min)</span>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem' }}>{modeIcon(nextMeeting.platform)} {nextMeeting.platform}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {nextMeeting.meetingUrl && (
                        <a href={nextMeeting.meetingUrl} target="_blank" rel="noreferrer" style={{
                          background: '#c9973a', color: '#fff', padding: '0.65rem 1.25rem',
                          borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center'
                        }}>
                          💻 Rejoindre en ligne (Jitsi)
                        </a>
                      )}
                      <div style={{
                        background: 'rgba(255,255,255,0.1)', color: '#fff',
                        padding: '0.65rem 1.25rem', borderRadius: '8px',
                        fontSize: '0.82rem', textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}>
                        🏛️ Présence physique possible
                      </div>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '1.25rem', padding: '0.75rem 1rem',
                    background: 'rgba(201,151,58,0.2)', borderRadius: '8px',
                    border: '1px solid rgba(201,151,58,0.4)',
                    display: 'flex', alignItems: 'center', gap: '0.75rem'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>🔀</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#c9973a' }}>Mode Hybride activé</div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>
                        Les membres peuvent participer en présentiel ou via Jitsi Meet simultanément
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ color: '#1a3a6b', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>📋 Ordre du jour</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {nextMeeting.agenda?.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.6rem 0.75rem', background: '#f8f5ef', borderRadius: '6px', alignItems: 'flex-start' }}>
                          <span style={{ color: '#c9973a', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>{item.order}.</span>
                          <div style={{ flex: 1, fontSize: '0.85rem', color: '#333', fontWeight: 500 }}>{item.title}</div>
                          {item.duration && <span style={{ fontSize: '0.72rem', color: '#8a8a8a', flexShrink: 0 }}>{item.duration} min</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ color: '#1a3a6b', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>📌 Instructions de participation</h3>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 700, color: '#2d6a4f', fontSize: '0.85rem', marginBottom: '0.5rem' }}>💻 Participation en ligne</div>
                      <div style={{ fontSize: '0.82rem', color: '#666', lineHeight: 1.6 }}>
                        1. Cliquez sur "Rejoindre en ligne (Jitsi)"<br/>
                        2. Entrez votre nom complet<br/>
                        3. Activez votre micro et caméra<br/>
                        4. Rejoignez la salle ACAFIS
                      </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 700, color: '#1a3a6b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>🏛️ Participation en présentiel</div>
                      <div style={{ fontSize: '0.82rem', color: '#666', lineHeight: 1.6 }}>
                        Lieu : {nextMeeting.location || '9100 Boul. Saint-Laurent # 600A, Montréal'}<br/>
                        Heure : {nextMeeting.time}<br/>
                        Présentez-vous 10 min avant le début
                      </div>
                    </div>
                    <div style={{ background: '#fdf0ee', borderRadius: '8px', padding: '0.75rem', borderLeft: '3px solid #c9973a' }}>
                      <div style={{ fontSize: '0.78rem', color: '#c9973a', fontWeight: 700 }}>⚠️ Important</div>
                      <div style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.25rem' }}>
                        Confirmez votre mode de participation avant la réunion.
                      </div>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button style={{ flex: 1, background: '#1a3a6b', color: '#fff', border: 'none', padding: '0.6rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}>
                        ✅ Je serai présent(e)
                      </button>
                      <button style={{ flex: 1, background: '#f8f5ef', color: '#1a3a6b', border: '1px solid #ede9e0', padding: '0.6rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}>
                        📱 En ligne
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TOUTES LES RÉUNIONS */}
            {activeTab === 'all' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {meetings.map((m) => (
                  <div key={m._id} style={{
                    background: '#fff', borderRadius: '10px', padding: '1.25rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    borderLeft: `4px solid ${statusColor[m.status] || '#8a8a8a'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.7rem', background: '#1a3a6b', color: '#fff', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: 700 }}>
                            {typeLabel[m.type]}
                          </span>
                          <span style={{ fontSize: '0.7rem', background: (statusColor[m.status] || '#8a8a8a') + '20', color: statusColor[m.status] || '#8a8a8a', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: 700 }}>
                            {m.status}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#8a8a8a' }}>{modeIcon(m.platform)} {m.platform}</span>
                        </div>
                        <div style={{ fontWeight: 700, color: '#1a3a6b', fontSize: '1rem' }}>{m.title}</div>
                        <div style={{ fontSize: '0.82rem', color: '#8a8a8a', marginTop: '0.25rem' }}>
                          {formatDate(m.date)} à {m.time} — {m.duration} min
                        </div>
                      </div>
                      {m.meetingUrl && (
                        <a href={m.meetingUrl} target="_blank" rel="noreferrer" style={{
                          background: '#c9973a', color: '#fff', padding: '0.45rem 0.9rem',
                          borderRadius: '6px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700
                        }}>
                          🎥 Rejoindre
                        </a>
                      )}
                    </div>
                    {m.agenda?.length > 0 && (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#8a8a8a' }}>
                        📋 {m.agenda.length} points à l'ordre du jour
                        {m.attendees?.length > 0 && ` · 👥 ${m.attendees.length} participants`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* AG 1ER AOÛT */}
            {activeTab === 'ag' && nextMeeting && (
              <div>
                <div style={{
                  background: 'linear-gradient(135deg, #1a3a6b, #2e5090)',
                  borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem',
                  color: '#fff', textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.78rem', color: '#c9973a', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    ASSEMBLÉE GÉNÉRALE ACAFIS 2026
                  </div>
                  <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.6rem' }}>{nextMeeting.title}</h2>
                  <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 1.5rem' }}>
                    {formatDate(nextMeeting.date)} à {nextMeeting.time}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    {[
                      { icon: '🔀', label: 'Mode',      value: 'Hybride' },
                      { icon: '⏱️', label: 'Durée',     value: `${nextMeeting.duration} min` },
                      { icon: '📋', label: 'Points ODJ', value: `${nextMeeting.agenda?.length || 0}` },
                      { icon: '👥', label: 'Membres',   value: '46' },
                    ].map((info, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem' }}>{info.icon}</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#c9973a' }}>{info.value}</div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>{info.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <a href={nextMeeting.meetingUrl} target="_blank" rel="noreferrer" style={{
                      background: '#c9973a', color: '#fff', padding: '0.75rem 1.5rem',
                      borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem'
                    }}>
                      💻 Rejoindre via Jitsi Meet
                    </a>
                    <button style={{
                      background: 'rgba(255,255,255,0.15)', color: '#fff',
                      border: '1px solid rgba(255,255,255,0.3)',
                      padding: '0.75rem 1.5rem', borderRadius: '8px',
                      cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem'
                    }}>
                      📄 Télécharger la convocation
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ color: '#1a3a6b', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>📋 Ordre du jour</h3>
                    {nextMeeting.agenda?.map((item, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: '0.75rem', padding: '0.65rem 0.75rem',
                        background: i % 2 === 0 ? '#f8f5ef' : '#fff',
                        borderRadius: '6px', marginBottom: '0.4rem', alignItems: 'flex-start'
                      }}>
                        <span style={{ color: '#c9973a', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, width: '20px' }}>{item.order}.</span>
                        <div style={{ flex: 1, fontSize: '0.83rem', color: '#333' }}>{item.title}</div>
                        {item.duration && <span style={{ fontSize: '0.7rem', color: '#8a8a8a', flexShrink: 0 }}>{item.duration}m</span>}
                      </div>
                    ))}
                  </div>

                  <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ color: '#1a3a6b', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>📊 Documents AG</h3>
                    {[
                      { icon: '💰', label: 'Rapport financier BHS',       status: '✅ Prêt',      color: '#2d6a4f' },
                      { icon: '🏗️', label: 'Rapport projet Cité Jardin', status: '⏳ En cours',   color: '#c9973a' },
                      { icon: '👥', label: 'Liste des 46 acquéreurs',     status: '✅ Prêt',      color: '#2d6a4f' },
                      { icon: '📋', label: 'PV dernière AG',              status: '⏳ En cours',   color: '#c9973a' },
                      { icon: '📄', label: 'Convocations membres',        status: '⏳ À envoyer', color: '#c0392b' },
                    ].map((doc, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.65rem 0.75rem', background: i % 2 === 0 ? '#f8f5ef' : '#fff',
                        borderRadius: '6px', marginBottom: '0.4rem'
                      }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span>{doc.icon}</span>
                          <span style={{ fontSize: '0.82rem', color: '#333' }}>{doc.label}</span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: doc.color, fontWeight: 700 }}>{doc.status}</span>
                      </div>
                    ))}
                    <button style={{
                      width: '100%', marginTop: '1rem', background: '#1a3a6b', color: '#fff',
                      border: 'none', padding: '0.7rem', borderRadius: '8px',
                      cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem'
                    }}>
                      📧 Envoyer convocations aux membres
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* FORMULAIRE NOUVELLE RÉUNION */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#1a3a6b', margin: 0 }}>+ Nouvelle réunion</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#8a8a8a' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {[
                { label: 'Titre',               key: 'title',      type: 'text',   placeholder: 'Ex: CA Ordinaire Août 2026' },
                { label: 'Date',                key: 'date',       type: 'date' },
                { label: 'Heure',               key: 'time',       type: 'time' },
                { label: 'Durée (minutes)',      key: 'duration',   type: 'number' },
                { label: 'Lien Jitsi',          key: 'meetingUrl', type: 'url',    placeholder: 'https://meet.jit.si/ACAFIS-...' },
                { label: 'Lieu (si présentiel)', key: 'location',  type: 'text',   placeholder: 'Ex: Montréal, QC' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {field.label}
                  </label>
                  <input type={field.type} value={form[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1.5px solid #ede9e0', borderRadius: '6px', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Type de réunion
                </label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1.5px solid #ede9e0', borderRadius: '6px', fontSize: '0.88rem', outline: 'none' }}>
                  <option value="ca_ordinaire">CA Ordinaire</option>
                  <option value="ca_extraordinaire">CA Extraordinaire</option>
                  <option value="ag_ordinaire">AG Ordinaire</option>
                  <option value="ag_extraordinaire">AG Extraordinaire</option>
                  <option value="commission">Commission</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Mode de participation
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[
                    { value: 'hybride',    label: '🔀 Hybride',    desc: 'Présentiel + En ligne' },
                    { value: 'online',     label: '💻 En ligne',   desc: 'Jitsi Meet seulement' },
                    { value: 'presentiel', label: '🏛️ Présentiel', desc: 'Sur place seulement' },
                  ].map(mode => (
                    <button key={mode.value} type="button"
                      onClick={() => setForm({ ...form, mode: mode.value })}
                      style={{
                        flex: 1, padding: '0.65rem 0.5rem', border: '2px solid',
                        borderColor: form.mode === mode.value ? '#1a3a6b' : '#ede9e0',
                        borderRadius: '8px', cursor: 'pointer', textAlign: 'center',
                        background: form.mode === mode.value ? '#EEF2F8' : '#fff',
                      }}>
                      <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#1a3a6b' }}>{mode.label}</div>
                      <div style={{ fontSize: '0.68rem', color: '#8a8a8a', marginTop: '0.2rem' }}>{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  flex: 1, padding: '0.75rem', background: '#f8f5ef',
                  border: '1px solid #ede9e0', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#666'
                }}>Annuler</button>
                <button type="submit" style={{
                  flex: 2, padding: '0.75rem', background: '#1a3a6b',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#fff'
                }}>✅ Créer la réunion</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}