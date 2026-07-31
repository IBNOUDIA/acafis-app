import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const statusColor = (s) => ({
  'à_jour':        '#2d6a4f',
  'retard_mineur': '#c9973a',
  'retard_majeur': '#c0392b',
  'suspendu':      '#666666',
}[s] || '#666666');

const METHOD_LABEL = {
  virement_interac:  'Virement Interac',
  virement_bancaire: 'Virement bancaire',
  cheque:            'Chèque',
  especes:           'Espèces',
  autre:             'Autre',
};

export default function MonCompte() {
  const navigate = useNavigate();
  const [member, setMember]   = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [memberRes, paymentsRes] = await Promise.all([
          api.get('/members/me'),
          api.get('/payments/me'),
        ]);
        setMember(memberRes.data.member);
        setPayments(paymentsRes.data.payments);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatMontant = (n) => (n || 0).toLocaleString('fr-FR') + ' FCFA';

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
              {member ? `${member.memberNumber} — ${member.firstName} ${member.lastName}` : 'Solde, historique et échéancier personnel'}
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8a8a8a' }}>⏳ Chargement...</div>
        ) : notFound ? (
          <div style={{ background: '#fff', borderRadius: '10px', padding: '2rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>ℹ️</div>
            <p style={{ color: '#666' }}>
              Aucune fiche membre (acquéreur) n'est associée à ce compte.<br />
              Contactez un administrateur si vous pensez que c'est une erreur.
            </p>
          </div>
        ) : (
          <>
            {/* SOLDE */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Montant total dû', value: formatMontant(member.financial?.totalAmount), icon: '📋', color: '#1a3a6b' },
                { label: 'Montant payé',     value: formatMontant(member.financial?.paidAmount),  icon: '✅', color: '#2d6a4f' },
                { label: 'Solde restant',    value: formatMontant(member.financial?.balance),     icon: '💰', color: '#c0392b' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: `4px solid ${s.color}` }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', color: '#8a8a8a', marginTop: '0.25rem' }}>{s.label}</div>
                </div>
              ))}

              <div style={{ background: '#fff', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: `4px solid ${statusColor(member.financial?.status)}` }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>📊</div>
                <span style={{
                  background: statusColor(member.financial?.status) + '20', color: statusColor(member.financial?.status),
                  padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700,
                }}>
                  {member.financial?.status}
                </span>
                <div style={{ fontSize: '0.78rem', color: '#8a8a8a', marginTop: '0.5rem' }}>Statut du compte</div>
              </div>
            </div>

            {/* COMMENT PAYER */}
            <div style={{ background: '#1a3a6b', borderRadius: '12px', padding: '1.75rem', marginBottom: '1.5rem', color: '#fff' }}>
              <div style={{ fontSize: '0.72rem', color: '#c9973a', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                💳 Comment payer
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>🇨🇦 Depuis le Canada</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>
                    Virement Interac (Banque TD) à :<br />
                    <strong style={{ color: '#c9973a' }}>acafisfinance@gmail.com</strong>
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>🇸🇳 Depuis le Sénégal / autre</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>
                    Virement bancaire — Banque de l'Habitat du Sénégal<br />
                    Compte <strong style={{ color: '#c9973a' }}>0 64 512722 L00</strong>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '1rem' }}>
                ⚠️ Merci d'indiquer votre nom et numéro de membre ({member.memberNumber}) en référence du virement.
              </div>
            </div>

            {/* HISTORIQUE */}
            <div style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '1.25rem 1.5rem 0.5rem', fontWeight: 700, color: '#1a3a6b' }}>
                📋 Historique de mes paiements
              </div>
              {payments.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#8a8a8a' }}>
                  Aucun paiement enregistré pour le moment.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#1a3a6b' }}>
                      {['Date', 'Type', 'Méthode', 'Montant', 'Statut'].map(h => (
                        <th key={h} style={{ padding: '0.85rem 1rem', color: '#fff', fontSize: '0.78rem', fontWeight: 700, textAlign: 'left', letterSpacing: '0.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, i) => (
                      <tr key={p._id} style={{ background: i % 2 === 0 ? '#f8f5ef' : '#fff', borderBottom: '1px solid #ede9e0' }}>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#333' }}>{new Date(p.paymentDate).toLocaleDateString('fr-FR')}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#666' }}>{p.type}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#666' }}>{METHOD_LABEL[p.method] || p.method}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.88rem', fontWeight: 700, color: '#2d6a4f' }}>{formatMontant(p.amount)}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            background: (p.status === 'confirmé' ? '#eaf4ee' : '#fdf0ee'),
                            color: (p.status === 'confirmé' ? '#2d6a4f' : '#c0392b'),
                            padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700,
                          }}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
