import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const CATEGORY_LABEL = {
  pv_reunion:        'PV de réunion',
  rapport_financier: 'Rapport financier',
};

export default function MonCompte() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await api.get('/documents');
        const relevant = res.data.documents.filter(
          d => d.category === 'pv_reunion' || d.category === 'rapport_financier'
        );
        setDocuments(relevant);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ef', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>

        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: '#1a3a6b', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>
              💳 Mon Compte
            </h1>
            <p style={{ color: '#8a8a8a', marginTop: '0.25rem' }}>
              PV et rapports de l'Assemblée Générale
            </p>
          </div>
          <button onClick={() => navigate('/dashboard')} style={{
            background: 'none', border: '1px solid #ede9e0', color: '#1a3a6b',
            padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
            fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit',
          }}>
            ← Retour au dashboard
          </button>
        </div>

        <div style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#1a3a6b' }}>
            📋 PV & Rapports de l'AG
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#8a8a8a' }}>⏳ Chargement...</div>
          ) : error ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#c0392b' }}>
              Impossible de charger les documents pour le moment.
            </div>
          ) : documents.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#8a8a8a' }}>
              Aucun PV ou rapport disponible pour le moment.
            </div>
          ) : (
            <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {documents.map(doc => (
                <a key={doc._id} href={doc.fileUrl} target="_blank" rel="noreferrer" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem',
                  background: '#f8f5ef', borderRadius: '8px', padding: '0.85rem 1rem',
                  textDecoration: 'none', color: '#333',
                }}>
                  <span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>📄 {doc.title}</span>
                    <span style={{
                      marginLeft: '0.6rem', fontSize: '0.68rem', fontWeight: 700, color: '#1a3a6b',
                      background: '#ede9e0', padding: '0.1rem 0.5rem', borderRadius: '20px',
                    }}>
                      {CATEGORY_LABEL[doc.category] || doc.category}
                    </span>
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#8a8a8a' }}>
                    {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
