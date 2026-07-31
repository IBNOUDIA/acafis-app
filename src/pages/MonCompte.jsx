import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { LOGO_NAV } from '../assets/logo';

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

const INTERAC_EMAIL = 'acafisfinance@gmail.com';

export default function MonCompte() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [member, setMember]     = useState(null);
  const [payments, setPayments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied]     = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(null); // id du paiement en cours
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const loadDocuments = async () => {
    try {
      const res = await api.get('/documents/me');
      setDocuments(res.data.documents);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [memberRes, paymentsRes] = await Promise.all([
          api.get('/members/me'),
          api.get('/payments/me'),
        ]);
        setMember(memberRes.data.member);
        setPayments(paymentsRes.data.payments);
        await loadDocuments();
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

  const copyInteracEmail = async () => {
    try {
      await navigator.clipboard.writeText(INTERAC_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponible — le lien mailto reste utilisable */
    }
  };

  const downloadReceipt = async (paymentId) => {
    setReceiptLoading(paymentId);
    try {
      const res = await api.get(`/payments/${paymentId}/receipt.pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Recu_${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du téléchargement du reçu");
    } finally {
      setReceiptLoading(null);
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      await api.post('/documents/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await loadDocuments();
    } catch (err) {
      console.error(err);
      setUploadError(err.response?.data?.message || "Erreur lors de l'envoi du fichier");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
            {/* CARTE DE MEMBRE */}
            <div style={{
              background: 'linear-gradient(135deg, #1a3a6b 0%, #12294d 100%)',
              borderRadius: '16px', padding: '1.75rem', marginBottom: '1.5rem', color: '#fff',
              position: 'relative', overflow: 'hidden', boxShadow: '0 8px 24px rgba(26,58,107,0.35)',
            }}>
              <div style={{
                position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px',
                borderRadius: '50%', background: 'rgba(201,151,58,0.15)',
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                <img src={LOGO_NAV} alt="CoopACAFIS" style={{ height: '28px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                <div style={{ fontSize: '0.68rem', color: '#c9973a', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'right' }}>
                  Carte de membre<br />Coopérative d'Habitat
                </div>
              </div>

              <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', position: 'relative' }}>
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{member.firstName} {member.lastName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', marginTop: '0.15rem' }}>
                    {member.email}{member.phone ? ` · ${member.phone}` : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    background: statusColor(member.financial?.status) + '30', color: '#fff',
                    border: `1px solid ${statusColor(member.financial?.status)}`,
                    padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700,
                  }}>
                    {member.status === 'actif' ? '✓ Actif' : member.status}
                  </span>
                </div>
              </div>

              <div style={{
                marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed rgba(255,255,255,0.25)',
                display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', position: 'relative',
              }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>N° membre</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'monospace', color: '#c9973a' }}>{member.memberNumber}</div>
                </div>
                {member.lot?.number && (
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Lot Ndianda</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>{member.lot.number}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Membre depuis</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{new Date(member.joinDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
                </div>
              </div>
            </div>

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
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', marginBottom: '0.6rem' }}>
                    Virement Interac (Banque TD) à :<br />
                    <strong style={{ color: '#c9973a' }}>{INTERAC_EMAIL}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={copyInteracEmail} style={{
                      background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.3)',
                      color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer',
                      fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit',
                    }}>
                      {copied ? '✓ Copié' : '📋 Copier l\'email'}
                    </button>
                    <a
                      href={`mailto:${INTERAC_EMAIL}?subject=${encodeURIComponent('Virement Interac — ' + member.memberNumber)}&body=${encodeURIComponent(`Bonjour,\n\nVeuillez trouver ci-joint mon virement Interac.\nMembre : ${member.firstName} ${member.lastName} (${member.memberNumber})\nMontant : ${formatMontant(member.financial?.balance)}\n\nMerci.`)}`}
                      style={{
                        background: '#c9973a', color: '#1a3a6b', textDecoration: 'none',
                        padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer',
                        fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center',
                      }}
                    >
                      ✉️ Préparer le virement
                    </a>
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
            <div style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
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
                      {['Date', 'Type', 'Méthode', 'Montant', 'Statut', 'Reçu'].map(h => (
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
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {p.status === 'confirmé' ? (
                            <button onClick={() => downloadReceipt(p._id)} disabled={receiptLoading === p._id} style={{
                              background: 'none', border: '1px solid #1a3a6b', color: '#1a3a6b',
                              padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer',
                              fontSize: '0.72rem', fontWeight: 600, fontFamily: 'inherit',
                              opacity: receiptLoading === p._id ? 0.6 : 1,
                            }}>
                              {receiptLoading === p._id ? '⏳' : '📄 PDF'}
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: '#bbb' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* MES DOCUMENTS */}
            <div style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ fontWeight: 700, color: '#1a3a6b' }}>
                  📎 Mes documents envoyés au Bureau
                </div>
                <div>
                  <input ref={fileInputRef} type="file" onChange={handleFileSelected} style={{ display: 'none' }} id="doc-upload" />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{
                    background: '#c9973a', color: '#1a3a6b', border: 'none',
                    padding: '0.5rem 1rem', borderRadius: '8px', cursor: uploading ? 'default' : 'pointer',
                    fontSize: '0.82rem', fontWeight: 700, fontFamily: 'inherit',
                    opacity: uploading ? 0.6 : 1,
                  }}>
                    {uploading ? '⏳ Envoi...' : '📤 Envoyer un document'}
                  </button>
                </div>
              </div>

              {uploadError && (
                <div style={{ padding: '0 1.5rem 0.75rem', color: '#c0392b', fontSize: '0.8rem' }}>{uploadError}</div>
              )}

              {documents.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#8a8a8a' }}>
                  Aucun document envoyé. Vous pouvez transmettre un reçu de virement, une pièce d'identité, etc.
                </div>
              ) : (
                <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {documents.map(doc => (
                    <a key={doc._id} href={doc.fileUrl} target="_blank" rel="noreferrer" style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: '#f8f5ef', borderRadius: '8px', padding: '0.75rem 1rem',
                      textDecoration: 'none', color: '#333',
                    }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>📄 {doc.title}</span>
                      <span style={{ fontSize: '0.72rem', color: '#8a8a8a' }}>
                        {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
