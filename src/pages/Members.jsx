import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LOGO_CARD } from '../assets/logo';
import Navbar from '../components/Navbar';

const statusConfig = {
  'à_jour':        { color: '#2d6a4f', bg: '#eaf4ee', label: '✅ En règle' },
  'retard_mineur': { color: '#c9973a', bg: '#fdf5e6', label: '⚠️ Retard mineur' },
  'retard_majeur': { color: '#c0392b', bg: '#fdf0ee', label: '🔴 Retard majeur' },
  'suspendu':      { color: '#666666', bg: '#f5f5f5', label: '⛔ Suspendu' },
};

function QRCode({ value, size = 52 }) {
  const cells = 8;
  const cellSize = size / cells;
  const pattern = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const hash = (r * 7 + c * 13 + (value.charCodeAt(r % value.length) || 0)) % 3;
      if (hash === 0) pattern.push({ r, c });
    }
  }
  const corners = [
    [0,0],[0,1],[0,2],[1,0],[2,0],[1,2],[2,1],[2,2],
    [0,5],[0,6],[0,7],[1,5],[2,5],[1,7],[2,6],[2,7],
    [5,0],[6,0],[7,0],[5,1],[5,2],[7,1],[6,2],[7,2],
  ];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" rx="4" />
      {pattern.map(({ r, c }, i) => (
        <rect key={i} x={c*cellSize} y={r*cellSize} width={cellSize-0.5} height={cellSize-0.5} fill="#1a3a6b" />
      ))}
      {corners.map(([r, c], i) => (
        <rect key={`k${i}`} x={c*cellSize} y={r*cellSize} width={cellSize-0.5} height={cellSize-0.5} fill="#1a3a6b" />
      ))}
    </svg>
  );
}

function MemberCardModal({ member, onClose }) {
  const [flipped, setFlipped] = useState(false);
  const status   = statusConfig[member.financial?.status] || statusConfig['retard_majeur'];
  const initials = `${member.firstName?.[0]||''}${member.lastName?.[0]||''}`.toUpperCase();

  const getPresence = (notes) => {
    if (notes?.includes('Procuration')) return { color: '#c9973a', label: '📋 Procuration' };
    if (notes?.includes('non confirmé')) return { color: '#8a8a8a', label: '⬜ Inconnu' };
    if (notes === '') return { color: '#2d6a4f', label: '✅ Présent AG' };
    return { color: '#c0392b', label: '❌ Absent AG' };
  };
  const presence = getPresence(member.notes);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '2rem',
        width: '100%', maxWidth: '420px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.4)'
      }} onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ color: '#1a3a6b', margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
              🪪 Carte de membre
            </h2>
            <p style={{ color: '#8a8a8a', margin: '2px 0 0', fontSize: '0.8rem' }}>
              {member.memberNumber} — {member.firstName} {member.lastName}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: '#f8f5ef', border: 'none', borderRadius: '50%',
            width: '34px', height: '34px', cursor: 'pointer', fontSize: '1rem', color: '#666'
          }}>✕</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          {!flipped ? (
            <div style={{
              width: '340px', height: '210px',
              background: 'linear-gradient(135deg, #1a3a6b 0%, #2e5090 60%, #1a3a6b 100%)',
              borderRadius: '16px', padding: '18px', position: 'relative',
              overflow: 'hidden', color: '#fff',
              boxShadow: '0 8px 32px rgba(26,58,107,0.4)', flexShrink: 0,
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                background: 'linear-gradient(90deg, #c9973a, #f0c060, #c9973a)' }} />
              <div style={{ position: 'absolute', top: '-40px', right: '-40px',
                width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'absolute', bottom: '-50px', left: '-20px',
                width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={LOGO_CARD} alt="CoopACAFIS"
                    style={{ height: '36px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                </div>
                <div style={{ background: status.color, padding: '3px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 700 }}>
                  {status.label}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  border: '2px solid rgba(201,151,58,0.7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', fontWeight: 800, color: '#c9973a', flexShrink: 0,
                }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, lineHeight: 1.2, marginBottom: '3px' }}>
                    {member.firstName} {member.lastName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                    🏘️ Cité Jardin Ndianda
                  </div>
                  <div style={{ fontSize: '10px', color: presence.color, marginTop: '3px', fontWeight: 700 }}>
                    {presence.label}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '14px' }}>
                <div>
                  <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    N° Membre
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.12em', color: '#c9973a' }}>
                    {member.memberNumber}
                  </div>
                  <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)' }}>
                    Adhésion : 2021
                  </div>
                </div>
                <QRCode value={`acafis/${member.memberNumber}`} size={52} />
              </div>
            </div>
          ) : (
            <div style={{
              width: '340px', height: '210px',
              background: '#f8f5ef', borderRadius: '16px', padding: '18px',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(26,58,107,0.15)', flexShrink: 0,
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                background: 'linear-gradient(90deg, #c9973a, #f0c060, #c9973a)' }} />
              <div style={{ position: 'absolute', top: '28px', left: 0, right: 0,
                height: '32px', background: '#1a3a6b', opacity: 0.07 }} />

              <div style={{ marginTop: '6px' }}>
                <div style={{
                  background: status.bg, border: `1px solid ${status.color}30`,
                  borderRadius: '8px', padding: '7px 12px', marginBottom: '10px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span style={{ fontSize: '11px', color: status.color, fontWeight: 700 }}>Statut financier</span>
                  <span style={{ fontSize: '11px', color: status.color, fontWeight: 800 }}>{status.label}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                  {[
                    { label: 'Montant dû', value: (member.financial?.totalAmount||0).toLocaleString('fr-FR') },
                    { label: 'Payé',       value: (member.financial?.paidAmount||0).toLocaleString('fr-FR') },
                    { label: 'Solde',      value: (member.financial?.balance||0).toLocaleString('fr-FR') },
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign: 'center', background: '#fff', borderRadius: '6px', padding: '6px 4px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                      <div style={{ fontSize: '7.5px', color: '#8a8a8a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#1a3a6b', marginTop: '2px' }}>{item.value}</div>
                      <div style={{ fontSize: '7px', color: '#8a8a8a' }}>FCFA</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <img src={LOGO_CARD} alt="CoopACAFIS"
                      style={{ height: '28px', objectFit: 'contain', opacity: 0.7 }} />
                  </div>
                  <div style={{ fontSize: '8px', color: '#8a8a8a', textAlign: 'right', lineHeight: 1.6 }}>
                    <div>📧 infos@coop-acafis.com</div>
                    <div>🌐 coop-acafis.com</div>
                    <div style={{ fontWeight: 700, color: '#1a3a6b' }}>Nguéniène, Sénégal</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <button onClick={() => setFlipped(!flipped)} style={{
            background: 'none', border: '1px solid #ede9e0',
            padding: '0.4rem 1.2rem', borderRadius: '20px',
            cursor: 'pointer', fontSize: '0.78rem', color: '#666', fontWeight: 600
          }}>
            🔄 {flipped ? 'Voir le recto' : 'Voir le verso'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => window.print()} style={{
            flex: 1, background: '#1a3a6b', color: '#fff', border: 'none',
            padding: '0.75rem', borderRadius: '8px', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.85rem'
          }}>🖨️ Imprimer</button>
          <button onClick={onClose} style={{
            flex: 1, background: '#f8f5ef', color: '#1a3a6b',
            border: '1px solid #ede9e0', padding: '0.75rem', borderRadius: '8px',
            cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem'
          }}>✕ Fermer</button>
        </div>
      </div>
    </div>
  );
}

// 🔑 Nouveau — formulaire d'ajout de membre
function AddMemberModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    lotType: 'villa_F3', lotNumber: '', lotPrice: '',
    totalAmount: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/members', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        lot: {
          type: form.lotType,
          number: form.lotNumber,
          price: form.lotPrice ? Number(form.lotPrice) : undefined,
        },
        financial: {
          totalAmount: form.totalAmount ? Number(form.totalAmount) : 0,
        },
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du membre');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#1a3a6b', margin: 0 }}>👥 Ajouter un membre</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#8a8a8a' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.35rem' }}>Prénom *</label>
              <input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #ede9e0', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.35rem' }}>Nom *</label>
              <input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #ede9e0', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.35rem' }}>Email *</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #ede9e0', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.35rem' }}>Téléphone</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #ede9e0', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.35rem' }}>Type de logement</label>
              <select value={form.lotType} onChange={e => setForm({ ...form, lotType: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #ede9e0', borderRadius: '6px' }}>
                <option value="villa_F3">Villa F3</option>
                <option value="villa_F4">Villa F4</option>
                <option value="villa_F5">Villa F5</option>
                <option value="villa_F6">Villa F6</option>
                <option value="appartement">Appartement</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.35rem' }}>N° du lot</label>
              <input value={form.lotNumber} onChange={e => setForm({ ...form, lotNumber: e.target.value })}
                placeholder="Ex: V-023"
                style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #ede9e0', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.35rem' }}>Prix du lot (FCFA)</label>
              <input type="number" value={form.lotPrice} onChange={e => setForm({ ...form, lotPrice: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #ede9e0', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.35rem' }}>Montant total dû (FCFA)</label>
              <input type="number" value={form.totalAmount} onChange={e => setForm({ ...form, totalAmount: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #ede9e0', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          {error && <div style={{ color: '#c0392b', fontSize: '0.82rem', marginBottom: '1rem' }}>⚠️ {error}</div>}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '0.75rem', background: '#f8f5ef',
              border: '1px solid #ede9e0', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#666'
            }}>Annuler</button>
            <button type="submit" disabled={loading} style={{
              flex: 2, padding: '0.75rem', background: '#1a3a6b',
              border: 'none', borderRadius: '8px', cursor: loading ? 'default' : 'pointer',
              fontWeight: 700, color: '#fff', opacity: loading ? 0.7 : 1
            }}>{loading ? 'Création...' : '✅ Créer le membre'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Members() {
  const navigate = useNavigate();
  const [members, setMembers]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState('');
  const [filterStatus, setFilterStatus]     = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [stats, setStats]                   = useState(null);
  const [showAddForm, setShowAddForm]       = useState(false); // 🔑 nouveau
  const [message, setMessage]               = useState('');   // 🔑 nouveau

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [membersRes, statsRes] = await Promise.all([
        api.get('/members'),
        api.get('/members/stats'),
      ]);
      setMembers(membersRes.data.members);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔑 Nouvelle fonction — suppression d'un membre, avec confirmation
  const handleDelete = async (member) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer ${member.firstName} ${member.lastName} (${member.memberNumber}) ?\n\nCette action est irréversible.`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/members/${member._id}`);
      setMessage('✅ Membre supprimé avec succès');
      setTimeout(() => setMessage(''), 3000);
      fetchData();
    } catch (err) {
      setMessage('❌ Erreur lors de la suppression');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const filtered = members.filter(m => {
    const matchSearch = !search ||
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      m.memberNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || m.financial?.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getPresence = (notes) => {
    if (notes?.includes('Procuration')) return { color: '#c9973a', label: '📋 Procuration' };
    if (notes?.includes('non confirmé')) return { color: '#8a8a8a', label: '⬜ Inconnu' };
    if (notes === '') return { color: '#2d6a4f', label: '✅ Présent' };
    return { color: '#c0392b', label: '❌ Absent' };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ef', fontFamily: "'DM Sans', sans-serif" }}>

      <Navbar />

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: '#1a3a6b', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>👥 Membres Acquéreurs</h1>
            <p style={{ color: '#8a8a8a', marginTop: '0.25rem' }}>Liste officielle AG — 46 membres — Cité Jardin Ndianda</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* 🔑 Nouveau bouton */}
            <button onClick={() => setShowAddForm(true)} style={{
              background: '#c9973a', color: '#fff', border: 'none',
              padding: '0.5rem 1.1rem', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 700, fontFamily: 'inherit',
            }}>
              + Ajouter un membre
            </button>
            <button onClick={() => navigate('/dashboard')} style={{
              background: 'none', border: '1px solid #ede9e0', color: '#1a3a6b',
              padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit',
            }}>
              ← Dashboard
            </button>
          </div>
        </div>

        {/* 🔑 Message de confirmation/erreur */}
        {message && (
          <div style={{
            background: message.includes('✅') ? '#eaf4ee' : '#fdf0ee',
            border: `1px solid ${message.includes('✅') ? '#2d6a4f' : '#c0392b'}`,
            color: message.includes('✅') ? '#2d6a4f' : '#c0392b',
            padding: '0.75rem 1.1rem', borderRadius: '8px',
            marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.85rem'
          }}>
            {message}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total membres', value: stats?.total || 0,    icon: '👥', color: '#1a3a6b' },
            { label: 'Actifs',        value: stats?.actifs || 0,   icon: '✅', color: '#2d6a4f' },
            { label: 'En règle',      value: stats?.aJour || 0,    icon: '💚', color: '#2d6a4f' },
            { label: 'En retard',     value: stats?.enRetard || 0, icon: '⚠️', color: '#c0392b' },
            { label: 'Présents AG',   value: 18,                   icon: '🏛️', color: '#2d6a4f' },
            { label: 'Procurations',  value: 10,                   icon: '📋', color: '#c9973a' },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: '10px', padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${s.color}`, textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: '#8a8a8a', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input type="text" placeholder="🔍 Rechercher un membre..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '200px', padding: '0.65rem 1rem', border: '1.5px solid #ede9e0', borderRadius: '8px', fontSize: '0.88rem', outline: 'none' }}
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{
            padding: '0.65rem 1rem', border: '1.5px solid #ede9e0', borderRadius: '8px',
            fontSize: '0.88rem', outline: 'none', background: '#fff', cursor: 'pointer'
          }}>
            <option value="">Tous les statuts</option>
            <option value="à_jour">✅ En règle</option>
            <option value="retard_mineur">⚠️ Retard mineur</option>
            <option value="retard_majeur">🔴 Retard majeur</option>
            <option value="suspendu">⛔ Suspendu</option>
          </select>
          <div style={{ padding: '0.65rem 1rem', background: '#1a3a6b', color: '#fff', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
            {filtered.length} / {members.length} membres
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8a8a8a' }}>⏳ Chargement...</div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1a3a6b' }}>
                  {['N°', 'Nom complet', 'Email', 'Statut financier', 'Présence AG', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.85rem 1rem', color: '#fff', fontSize: '0.75rem', fontWeight: 700, textAlign: 'left', letterSpacing: '0.06em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => {
                  const status   = statusConfig[m.financial?.status] || statusConfig['retard_majeur'];
                  const presence = getPresence(m.notes);
                  const initials = `${m.firstName?.[0]||''}${m.lastName?.[0]||''}`.toUpperCase();
                  return (
                    <tr key={m._id} style={{ background: i % 2 === 0 ? '#f8f5ef' : '#fff', borderBottom: '1px solid #ede9e0' }}>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#8a8a8a', fontFamily: 'monospace', fontWeight: 700 }}>
                        {m.memberNumber}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '50%',
                            background: '#1a3a6b', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: '#c9973a', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#1a3a6b', fontSize: '0.88rem' }}>
                              {m.firstName} {m.lastName}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#8a8a8a' }}>Adhésion 2021</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#666' }}>{m.email}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ background: status.bg, color: status.color, padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ background: presence.color + '20', color: presence.color, padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
                          {presence.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button onClick={() => setSelectedMember(m)} style={{
                            background: '#1a3a6b', color: '#fff', border: 'none',
                            padding: '0.35rem 0.8rem', borderRadius: '6px',
                            cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700
                          }}>
                            🪪 Carte
                          </button>
                          {/* 🔑 Nouveau bouton de suppression */}
                          <button onClick={() => handleDelete(m)} style={{
                            background: '#fdf0ee', color: '#c0392b', border: 'none',
                            padding: '0.35rem 0.6rem', borderRadius: '6px',
                            cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700
                          }}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedMember && (
        <MemberCardModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}

      {/* 🔑 Formulaire d'ajout de membre */}
      {showAddForm && (
        <AddMemberModal
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            fetchData(); // 🔑 recharge la liste — c'était l'oubli qui causait le bug
            setMessage('✅ Membre créé avec succès');
            setTimeout(() => setMessage(''), 3000);
          }}
        />
      )}
    </div>
  );
}