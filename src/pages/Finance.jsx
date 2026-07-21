import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

export default function Finance() {
  const navigate = useNavigate();
  const [payments, setPayments]   = useState([]);
  const [stats, setStats]         = useState(null);
  const [members, setMembers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paymentsRes, statsRes, membersRes] = await Promise.all([
          api.get('/payments'),
          api.get('/payments/stats'),
          api.get('/members'),
        ]);
        setPayments(paymentsRes.data.payments);
        setStats(statsRes.data.stats);
        setMembers(membersRes.data.members);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatMontant = (n) => (n || 0).toLocaleString('fr-FR') + ' FCFA';

  const statusColor = (s) => ({
    'à_jour':       '#2d6a4f',
    'retard_mineur':'#c9973a',
    'retard_majeur':'#c0392b',
    'suspendu':     '#666666',
  }[s] || '#666666');

  const BHS = {
    soldeDebut:   6909110,
    totalCredits:  920200,
    totalDebits:  4011900,
    soldeFinal:   3817410,
  };

  const tabs = [
    { id: 'overview',     label: '📊 Vue générale' },
    { id: 'transactions', label: '💳 Transactions' },
    { id: 'membres',      label: '👥 État membres' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ef', fontFamily: "'DM Sans', sans-serif" }}>

      {/* 🔑 Navbar partagée — hamburger, langue, déconnexion, lien mot de passe */}
      <Navbar />

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: '#1a3a6b', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>
              💰 Suivi Financier
            </h1>
            <p style={{ color: '#8a8a8a', marginTop: '0.25rem' }}>
              Compte BHS — Coopérative d'Habitat ACAFIS
            </p>
          </div>
          {/* 🔑 navigate() au lieu de <a href> — retour instantané au dashboard */}
          <button onClick={() => navigate('/dashboard')} style={{
            background: 'none', border: '1px solid #ede9e0', color: '#1a3a6b',
            padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
            fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit',
          }}>
            ← Retour au dashboard
          </button>
        </div>

        {/* SOLDE BHS */}
        <div style={{ background: '#1a3a6b', borderRadius: '12px', padding: '1.75rem', marginBottom: '1.5rem', color: '#fff' }}>
          <div style={{ fontSize: '0.72rem', color: '#c9973a', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            🏦 Banque de l'Habitat du Sénégal — Compte 0 64 512722 L00
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
            {[
              { label: 'Solde au 01/01/2026',      value: formatMontant(BHS.soldeDebut),   color: '#fff' },
              { label: 'Total cotisations reçues',  value: formatMontant(BHS.totalCredits), color: '#7effa0' },
              { label: 'Total dépenses',            value: formatMontant(BHS.totalDebits),  color: '#ff9a9a' },
              { label: 'Solde au 13/07/2026',       value: formatMontant(BHS.soldeFinal),   color: '#c9973a' },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.3rem' }}>{item.label}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ONGLETS */}
        <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '2px solid #ede9e0' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0.75rem 1.25rem', fontSize: '0.82rem', fontWeight: 600,
              color: activeTab === tab.id ? '#1a3a6b' : '#8a8a8a',
              borderBottom: activeTab === tab.id ? '3px solid #c9973a' : '3px solid transparent',
              marginBottom: '-2px', transition: 'all 0.2s'
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8a8a8a' }}>⏳ Chargement...</div>
        ) : (
          <>
            {/* VUE GÉNÉRALE */}
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                {[
                  { label: 'Total collecté',    value: formatMontant(stats?.totalCollecté),                    icon: '💰', color: '#2d6a4f' },
                  { label: 'Nb paiements',      value: stats?.nombrePaiements || 0,                            icon: '📋', color: '#1a3a6b' },
                  { label: 'Moyenne/paiement',  value: formatMontant(Math.round(stats?.moyennePaiement || 0)), icon: '📊', color: '#c9973a' },
                  { label: 'Solde BHS actuel',  value: formatMontant(BHS.soldeFinal),                          icon: '🏦', color: '#1a3a6b' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: `4px solid ${s.color}` }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '0.78rem', color: '#8a8a8a', marginTop: '0.25rem' }}>{s.label}</div>
                  </div>
                ))}

                <div style={{ background: '#fff', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: '4px solid #c0392b', gridColumn: '1 / -1' }}>
                  <h3 style={{ color: '#1a3a6b', marginBottom: '1rem', fontSize: '1rem' }}>
                    🏗️ Dépenses engagées — Studio Architecture Amadou M. SAR
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {[
                      { date: '25/02/2026', desc: 'Acompte 1 — Architecture', montant: 2500000 },
                      { date: '05/03/2026', desc: 'Acompte 2 — Architecture', montant: 1500000 },
                      { date: 'Divers',     desc: 'Frais bancaires',          montant: 11900 },
                    ].map((d, i) => (
                      <div key={i} style={{ background: '#fdf0ee', borderRadius: '8px', padding: '1rem', borderLeft: '3px solid #c0392b' }}>
                        <div style={{ fontSize: '0.72rem', color: '#8a8a8a' }}>{d.date}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#333', margin: '0.25rem 0' }}>{d.desc}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#c0392b' }}>{d.montant.toLocaleString('fr-FR')} FCFA</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TRANSACTIONS */}
            {activeTab === 'transactions' && (
              <div style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#1a3a6b' }}>
                      {['Date', 'Référence', 'Membre', 'Type', 'Montant', 'Statut'].map(h => (
                        <th key={h} style={{ padding: '0.85rem 1rem', color: '#fff', fontSize: '0.78rem', fontWeight: 700, textAlign: 'left', letterSpacing: '0.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, i) => (
                      <tr key={p._id} style={{ background: i % 2 === 0 ? '#f8f5ef' : '#fff', borderBottom: '1px solid #ede9e0' }}>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#333' }}>{new Date(p.paymentDate).toLocaleDateString('fr-FR')}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#8a8a8a', fontFamily: 'monospace' }}>{p.reference}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#333', fontWeight: 600 }}>{p.member?.firstName} {p.member?.lastName}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#666' }}>{p.type}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.88rem', fontWeight: 700, color: '#2d6a4f' }}>{p.amount.toLocaleString('fr-FR')} FCFA</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ background: '#eaf4ee', color: '#2d6a4f', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
                            ✓ {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ÉTAT MEMBRES */}
            {activeTab === 'membres' && (
              <div style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#1a3a6b' }}>
                      {['N°', 'Nom', 'Montant dû', 'Payé', 'Solde', 'Statut'].map(h => (
                        <th key={h} style={{ padding: '0.85rem 1rem', color: '#fff', fontSize: '0.78rem', fontWeight: 700, textAlign: 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m, i) => (
                      <tr key={m._id} style={{ background: i % 2 === 0 ? '#f8f5ef' : '#fff', borderBottom: '1px solid #ede9e0' }}>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#8a8a8a', fontFamily: 'monospace' }}>{m.memberNumber}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: '#1a3a6b' }}>{m.firstName} {m.lastName}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#333' }}>{m.financial?.totalAmount?.toLocaleString('fr-FR')} FCFA</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#2d6a4f', fontWeight: 600 }}>{m.financial?.paidAmount?.toLocaleString('fr-FR')} FCFA</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#c0392b', fontWeight: 600 }}>{m.financial?.balance?.toLocaleString('fr-FR')} FCFA</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ background: statusColor(m.financial?.status) + '20', color: statusColor(m.financial?.status), padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
                            {m.financial?.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
