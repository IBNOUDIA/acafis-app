import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Communications() {
  const { user }                        = useAuth();
  const navigate                        = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [message, setMessage]           = useState('');
  const [form, setForm]                 = useState({
    title: '', content: '', type: 'annonce', priority: 'normale', audience: 'tous'
  });

  const isAdmin = ['super_admin', 'admin'].includes(user?.role);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    // Données simulées en attendant le backend
    setAnnouncements([
      {
        _id: '1',
        title: '🏛️ AG du 1er août 2026 — Rappel',
        content: 'Rappel important : L\'Assemblée Générale Annuelle de la Coopérative d\'Habitat ACAFIS se tiendra le 1er août 2026 à 14h00. Mode hybride — présentiel au 9100 Boul. Saint-Laurent #600A et en ligne via Jitsi Meet. Votre présence est essentielle pour le quorum.',
        type: 'urgent',
        priority: 'haute',
        audience: 'tous',
        author: 'Omar Sarr — Président',
        createdAt: new Date('2026-07-15'),
        views: 24,
      },
      {
        _id: '2',
        title: '💰 Rapport financier BHS disponible',
        content: 'Le rapport financier de la Banque de l\'Habitat du Sénégal (BHS) pour la période du 01/01/2026 au 13/07/2026 est maintenant disponible. Solde actuel : 3 817 410 FCFA. Consultez le module Finance pour plus de détails.',
        type: 'info',
        priority: 'normale',
        audience: 'ca',
        author: 'Bintou Sarr — Trésorière',
        createdAt: new Date('2026-07-13'),
        views: 18,
      },
      {
        _id: '3',
        title: '🏗️ Avancement projet Cité Jardin Ndianda',
        content: 'Les plans architecturaux du projet Cité Jardin Ndianda sont en cours de finalisation avec Studio SAAMS. Une présentation détaillée sera faite lors de l\'AG du 1er août. Le projet prévoit 320 logements à Nguéniène, Sénégal.',
        type: 'info',
        priority: 'normale',
        audience: 'tous',
        author: 'Omar Sarr — Président',
        createdAt: new Date('2026-07-10'),
        views: 32,
      },
      {
        _id: '4',
        title: '📋 Mise à jour des cotisations',
        content: 'Rappel à tous les acquéreurs : les cotisations annuelles doivent être à jour avant l\'AG du 1er août 2026. Contactez la trésorerie pour tout arrangement de paiement.',
        type: 'rappel',
        priority: 'haute',
        audience: 'acquereurs',
        author: 'Bintou Sarr — Trésorière',
        createdAt: new Date('2026-07-08'),
        views: 41,
      },
    ]);
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAnnouncement = {
      _id: Date.now().toString(),
      ...form,
      author: `${user?.firstName} ${user?.lastName} — ${user?.position}`,
      createdAt: new Date(),
      views: 0,
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setShowForm(false);
    setForm({ title: '', content: '', type: 'annonce', priority: 'normale', audience: 'tous' });
    setMessage('✅ Annonce publiée avec succès !');
    setTimeout(() => setMessage(''), 3000);
  };

  const typeConfig = {
    urgent:  { color: '#c0392b', bg: '#fdf0ee', icon: '🚨', label: 'Urgent' },
    info:    { color: '#1a3a6b', bg: '#eef2f8', icon: 'ℹ️',  label: 'Information' },
    rappel:  { color: '#c9973a', bg: '#fdf5e6', icon: '🔔', label: 'Rappel' },
    annonce: { color: '#2d6a4f', bg: '#eaf4ee', icon: '📢', label: 'Annonce' },
  };

  const audienceConfig = {
    tous:       { label: '🌐 Tous',        color: '#1a3a6b' },
    ca:         { label: '🏛️ CA seulement', color: '#4a1942' },
    acquereurs: { label: '👥 Acquéreurs',  color: '#2d6a4f' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ef', fontFamily: "'DM Sans', sans-serif" }}>

      {/* 🔑 Navbar partagée — hamburger, langue, déconnexion, lien mot de passe */}
      <Navbar />

      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>

        {/* TITRE */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: '#1a3a6b', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>
              📢 Communications
            </h1>
            <p style={{ color: '#8a8a8a', marginTop: '0.25rem' }}>
              Annonces et communications officielles du CA ACAFIS
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {isAdmin && (
              <button onClick={() => setShowForm(true)} style={{
                background: '#c9973a', color: '#fff', border: 'none',
                padding: '0.5rem 1rem', borderRadius: '6px',
                cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'inherit',
              }}>
                + Nouvelle annonce
              </button>
            )}
            {/* 🔑 navigate() au lieu de <a href> */}
            <button onClick={() => navigate('/dashboard')} style={{
              background: 'none', border: '1px solid #ede9e0', color: '#1a3a6b',
              padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit',
            }}>
              ← Dashboard
            </button>
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <div style={{
            background: '#eaf4ee', border: '1px solid #2d6a4f',
            color: '#2d6a4f', padding: '0.85rem 1.25rem',
            borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600
          }}>
            {message}
          </div>
        )}

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Annonces',  value: announcements.length,                                        icon: '📢', color: '#1a3a6b' },
            { label: 'Urgentes',  value: announcements.filter(a => a.type === 'urgent').length,       icon: '🚨', color: '#c0392b' },
            { label: 'Rappels',   value: announcements.filter(a => a.type === 'rappel').length,      icon: '🔔', color: '#c9973a' },
            { label: 'Vues total',value: announcements.reduce((acc, a) => acc + (a.views || 0), 0),  icon: '👁️', color: '#2d6a4f' },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: '10px', padding: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${s.color}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.4rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: '#8a8a8a' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ANNONCES */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8a8a8a' }}>⏳ Chargement...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {announcements.map((ann) => {
              const type     = typeConfig[ann.type] || typeConfig['annonce'];
              const audience = audienceConfig[ann.audience] || audienceConfig['tous'];
              return (
                <div key={ann._id} style={{
                  background: '#fff', borderRadius: '12px', padding: '1.5rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  borderLeft: `5px solid ${type.color}`
                }}>
                  {/* En-tête */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{
                          background: type.bg, color: type.color,
                          padding: '0.15rem 0.6rem', borderRadius: '10px',
                          fontSize: '0.72rem', fontWeight: 700
                        }}>
                          {type.icon} {type.label}
                        </span>
                        <span style={{
                          background: '#f0f0f0', color: audience.color,
                          padding: '0.15rem 0.6rem', borderRadius: '10px',
                          fontSize: '0.72rem', fontWeight: 600
                        }}>
                          {audience.label}
                        </span>
                        {ann.priority === 'haute' && (
                          <span style={{ background: '#fdf0ee', color: '#c0392b', padding: '0.15rem 0.6rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700 }}>
                            🔴 Priorité haute
                          </span>
                        )}
                      </div>
                      <h3 style={{ color: '#1a3a6b', margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                        {ann.title}
                      </h3>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#8a8a8a', textAlign: 'right', flexShrink: 0 }}>
                      <div>📅 {new Date(ann.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <div style={{ marginTop: '2px' }}>👁️ {ann.views} vues</div>
                    </div>
                  </div>

                  {/* Contenu */}
                  <p style={{ color: '#555', fontSize: '0.88rem', lineHeight: 1.7, margin: '0 0 0.75rem' }}>
                    {ann.content}
                  </p>

                  {/* Pied */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #ede9e0' }}>
                    <div style={{ fontSize: '0.78rem', color: '#8a8a8a' }}>
                      ✍️ {ann.author}
                    </div>
                    {isAdmin && (
                      <button style={{
                        background: '#fdf0ee', color: '#c0392b', border: 'none',
                        padding: '0.3rem 0.7rem', borderRadius: '6px',
                        cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700
                      }}>
                        🗑️ Supprimer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FORMULAIRE */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#1a3a6b', margin: 0 }}>📢 Nouvelle annonce</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#8a8a8a' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {/* Titre */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Titre *
                </label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Titre de l'annonce" required
                  style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #ede9e0', borderRadius: '6px', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Contenu */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Contenu *
                </label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Contenu de l'annonce..." rows={4} required
                  style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #ede9e0', borderRadius: '6px', fontSize: '0.88rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              {/* Type + Priorité */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Type
                  </label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #ede9e0', borderRadius: '6px', fontSize: '0.88rem', outline: 'none' }}>
                    <option value="annonce">📢 Annonce</option>
                    <option value="urgent">🚨 Urgent</option>
                    <option value="rappel">🔔 Rappel</option>
                    <option value="info">ℹ️ Information</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Priorité
                  </label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #ede9e0', borderRadius: '6px', fontSize: '0.88rem', outline: 'none' }}>
                    <option value="normale">Normale</option>
                    <option value="haute">🔴 Haute</option>
                  </select>
                </div>
              </div>

              {/* Audience */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Audience
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[
                    { value: 'tous',       label: '🌐 Tous' },
                    { value: 'ca',         label: '🏛️ CA' },
                    { value: 'acquereurs', label: '👥 Acquéreurs' },
                  ].map(aud => (
                    <button key={aud.value} type="button"
                      onClick={() => setForm({ ...form, audience: aud.value })}
                      style={{
                        flex: 1, padding: '0.6rem', border: '2px solid',
                        borderColor: form.audience === aud.value ? '#1a3a6b' : '#ede9e0',
                        borderRadius: '8px', cursor: 'pointer',
                        background: form.audience === aud.value ? '#EEF2F8' : '#fff',
                        fontSize: '0.78rem', fontWeight: 600, color: '#1a3a6b'
                      }}>
                      {aud.label}
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
                }}>📢 Publier l'annonce</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
