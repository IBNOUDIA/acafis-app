import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const categoryConfig = {
  pv_reunion:       { label: 'PV Réunion',        icon: '📋', color: '#1a3a6b' },
  rapport_financier:{ label: 'Rapport Financier',  icon: '💰', color: '#c9973a' },
  statuts:          { label: 'Statuts',            icon: '📜', color: '#4a1942' },
  contrat:          { label: 'Contrat',            icon: '🤝', color: '#2d6a4f' },
  convocation:      { label: 'Convocation',        icon: '📨', color: '#023e8a' },
  resolution:       { label: 'Résolution',         icon: '✅', color: '#2d6a4f' },
  photo_chantier:   { label: 'Photo Chantier',     icon: '🏗️', color: '#c0392b' },
  autre:            { label: 'Autre',              icon: '📁', color: '#666' },
};

const visibilityConfig = {
  public:      { label: '🌐 Public',       color: '#2d6a4f' },
  ca_only:     { label: '🔒 CA Seulement', color: '#1a3a6b' },
  acquereurs:  { label: '👥 Acquéreurs',   color: '#c9973a' },
  finance_only:{ label: '💰 Finance',      color: '#c0392b' },
};

export default function Documents() {
  const { user }                    = useAuth();
  const navigate                    = useNavigate();
  const [documents, setDocuments]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [filterCat, setFilterCat]   = useState('');
  const [search, setSearch]         = useState('');
  const [message, setMessage]       = useState('');
  const [form, setForm]             = useState({
    title: '', description: '', category: 'pv_reunion',
    fileUrl: '', visibility: 'ca_only', tags: ''
  });

  const isAdmin = ['super_admin', 'admin', 'admin_finance', 'membre_ca'].includes(user?.role);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/documents', {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        fileUrl: form.fileUrl || '#',
      });
      setShowForm(false);
      setForm({ title: '', description: '', category: 'pv_reunion', fileUrl: '', visibility: 'ca_only', tags: '' });
      setMessage('✅ Document ajouté avec succès !');
      setTimeout(() => setMessage(''), 3000);
      fetchData();
    } catch (err) {
      setMessage('❌ Erreur lors de l\'ajout');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Archiver ce document ?')) return;
    try {
      await api.delete(`/documents/${id}`);
      setMessage('✅ Document archivé');
      setTimeout(() => setMessage(''), 3000);
      fetchData();
    } catch (err) {
      setMessage('❌ Erreur lors de l\'archivage');
    }
  };

  const filtered = documents.filter(d => {
    const matchCat    = !filterCat || d.category === filterCat;
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Documents importants prédéfinis
  const DOCS_IMPORTANTS = [
    { icon: '💰', title: 'Rapport Financier BHS — AG 2026', desc: 'Solde : 3 817 410 FCFA au 13/07/2026', status: '✅ Disponible', color: '#2d6a4f', url: '#' },
    { icon: '👥', title: 'Liste des 46 Acquéreurs', desc: 'Liste officielle AG — Cité Jardin Ndianda', status: '✅ Disponible', color: '#2d6a4f', url: '#' },
    { icon: '📋', title: 'Ordre du Jour — AG 1er Août 2026', desc: '8 points — Mode hybride Jitsi + Présentiel', status: '✅ Disponible', color: '#2d6a4f', url: '#' },
    { icon: '📄', title: 'Convocations Membres', desc: 'À envoyer aux 46 acquéreurs', status: '⏳ À préparer', color: '#c9973a', url: '#' },
    { icon: '📜', title: 'Statuts de la Coopérative', desc: 'Document fondateur ACAFIS', status: '⏳ À uploader', color: '#c9973a', url: '#' },
    { icon: '🏗️', title: 'Rapport Projet Cité Jardin Ndianda', desc: 'Avancement chantier — Studio SAR', status: '⏳ En cours', color: '#c9973a', url: '#' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ef', fontFamily: "'DM Sans', sans-serif" }}>

      {/* 🔑 Navbar partagée — hamburger, langue, déconnexion, lien mot de passe */}
      <Navbar />

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

        {/* TITRE */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: '#1a3a6b', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>
              📄 Documents
            </h1>
            <p style={{ color: '#8a8a8a', marginTop: '0.25rem' }}>
              PV, rapports, statuts et documents officiels ACAFIS
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {isAdmin && (
              <button onClick={() => setShowForm(true)} style={{
                background: '#c9973a', color: '#fff', border: 'none',
                padding: '0.5rem 1rem', borderRadius: '6px',
                cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'inherit',
              }}>
                + Ajouter document
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
            background: message.includes('✅') ? '#eaf4ee' : '#fdf0ee',
            border: `1px solid ${message.includes('✅') ? '#2d6a4f' : '#c0392b'}`,
            color: message.includes('✅') ? '#2d6a4f' : '#c0392b',
            padding: '0.85rem 1.25rem', borderRadius: '8px',
            marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.88rem'
          }}>
            {message}
          </div>
        )}

        {/* DOCUMENTS IMPORTANTS AG */}
        <div style={{ background: '#1a3a6b', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#c9973a', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            📅 Documents AG du 1er Août 2026
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {DOCS_IMPORTANTS.map((doc, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '1rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{doc.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.15rem' }}>
                      {doc.title}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem' }}>{doc.desc}</div>
                  </div>
                </div>
                <span style={{ color: doc.color, fontSize: '0.72rem', fontWeight: 700, flexShrink: 0, marginLeft: '0.75rem' }}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* FILTRES */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input type="text" placeholder="🔍 Rechercher un document..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '200px', padding: '0.65rem 1rem', border: '1.5px solid #ede9e0', borderRadius: '8px', fontSize: '0.88rem', outline: 'none' }}
          />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{
            padding: '0.65rem 1rem', border: '1.5px solid #ede9e0', borderRadius: '8px',
            fontSize: '0.88rem', outline: 'none', background: '#fff', cursor: 'pointer'
          }}>
            <option value="">Toutes les catégories</option>
            {Object.entries(categoryConfig).map(([key, val]) => (
              <option key={key} value={key}>{val.icon} {val.label}</option>
            ))}
          </select>
          <div style={{ padding: '0.65rem 1rem', background: '#1a3a6b', color: '#fff', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
            {filtered.length} document{filtered.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* LISTE DOCUMENTS */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8a8a8a' }}>⏳ Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
            <div style={{ color: '#1a3a6b', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Aucun document
            </div>
            <div style={{ color: '#8a8a8a', fontSize: '0.88rem' }}>
              {isAdmin ? 'Cliquez sur "+ Ajouter document" pour commencer.' : 'Aucun document disponible pour votre rôle.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {filtered.map((doc) => {
              const cat = categoryConfig[doc.category] || categoryConfig['autre'];
              const vis = visibilityConfig[doc.visibility] || visibilityConfig['ca_only'];
              return (
                <div key={doc._id} style={{
                  background: '#fff', borderRadius: '12px', padding: '1.25rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  borderLeft: `4px solid ${cat.color}`,
                  display: 'flex', flexDirection: 'column', gap: '0.75rem'
                }}>
                  {/* En-tête */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{cat.icon}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: '#1a3a6b', fontSize: '0.92rem', marginBottom: '0.2rem' }}>
                          {doc.title}
                        </div>
                        {doc.description && (
                          <div style={{ fontSize: '0.78rem', color: '#666', lineHeight: 1.5 }}>
                            {doc.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    <span style={{ background: cat.color + '15', color: cat.color, padding: '0.15rem 0.6rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700 }}>
                      {cat.icon} {cat.label}
                    </span>
                    <span style={{ background: '#f0f0f0', color: vis.color, padding: '0.15rem 0.6rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 600 }}>
                      {vis.label}
                    </span>
                    {doc.tags?.map((tag, i) => (
                      <span key={i} style={{ background: '#f8f5ef', color: '#8a8a8a', padding: '0.15rem 0.6rem', borderRadius: '10px', fontSize: '0.7rem' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Infos + Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #ede9e0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#8a8a8a' }}>
                      📅 {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                      {doc.uploadedBy && ` · ${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}`}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {doc.fileUrl && doc.fileUrl !== '#' && (
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" style={{
                          background: '#1a3a6b', color: '#fff', padding: '0.3rem 0.7rem',
                          borderRadius: '6px', textDecoration: 'none', fontSize: '0.72rem', fontWeight: 700
                        }}>
                          ⬇ Télécharger
                        </a>
                      )}
                      {['super_admin', 'admin'].includes(user?.role) && (
                        <button onClick={() => handleDelete(doc._id)} style={{
                          background: '#fdf0ee', color: '#c0392b', border: 'none',
                          padding: '0.3rem 0.7rem', borderRadius: '6px',
                          cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700
                        }}>
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FORMULAIRE AJOUT DOCUMENT */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#1a3a6b', margin: 0 }}>📄 Ajouter un document</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#8a8a8a' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {/* Titre */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Titre *
                </label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: PV AG du 1er août 2026" required
                  style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #ede9e0', borderRadius: '6px', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Description
                </label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Description du document..." rows={2}
                  style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #ede9e0', borderRadius: '6px', fontSize: '0.88rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              {/* Catégorie */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Catégorie *
                </label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #ede9e0', borderRadius: '6px', fontSize: '0.88rem', outline: 'none' }}>
                  {Object.entries(categoryConfig).map(([key, val]) => (
                    <option key={key} value={key}>{val.icon} {val.label}</option>
                  ))}
                </select>
              </div>

              {/* URL fichier */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Lien du fichier (URL)
                </label>
                <input type="url" value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #ede9e0', borderRadius: '6px', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ fontSize: '0.72rem', color: '#8a8a8a', marginTop: '0.3rem' }}>
                  💡 Collez un lien Google Drive, Dropbox ou autre
                </div>
              </div>

              {/* Visibilité */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Visibilité
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {Object.entries(visibilityConfig).map(([key, val]) => (
                    <button key={key} type="button" onClick={() => setForm({ ...form, visibility: key })} style={{
                      padding: '0.6rem', border: '2px solid',
                      borderColor: form.visibility === key ? '#1a3a6b' : '#ede9e0',
                      borderRadius: '8px', cursor: 'pointer', textAlign: 'center',
                      background: form.visibility === key ? '#EEF2F8' : '#fff',
                      fontSize: '0.78rem', fontWeight: 600, color: '#1a3a6b'
                    }}>
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Tags (séparés par virgule)
                </label>
                <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="Ex: AG2026, finance, BHS"
                  style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #ede9e0', borderRadius: '6px', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  flex: 1, padding: '0.75rem', background: '#f8f5ef',
                  border: '1px solid #ede9e0', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#666'
                }}>Annuler</button>
                <button type="submit" style={{
                  flex: 2, padding: '0.75rem', background: '#1a3a6b',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#fff'
                }}>📄 Ajouter le document</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
