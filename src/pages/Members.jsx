import { useState, useEffect } from 'react';
import api from '../services/api';
import { LOGO_NAV, LOGO_CARD } from '../assets/logo';

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

        {/* En-tête */}
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

        {/* CARTE */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          {!flipped ? (
            /* ── RECTO ── */
            <div style={{
              width: '340px', height: '210px',
              background: 'linear-gradient(135deg, #1a3a6b 0%, #2e5090 60%, #1a3a6b 100%)',
              borderRadius: '16px', padding: '18px', position: 'relative',
              overflow: 'hidden', color: '#fff',
              boxShadow: '0 8px 32px rgba(26,58,107,0.4)', flexShrink: 0,
            }}>
              {/* Ligne dorée */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                background: 'linear-gradient(90deg, #c9973a, #f0c060, #c9973a)' }} />
              {/* Cercles décoratifs */}
              <div style={{ position: 'absolute', top: '-40px', right: '-40px',
                width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'absolute', bottom: '-50px', left: '-20px',
                width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

              {/* En-tête carte */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={LOGO_CARD} alt="CoopACАFIS"
                    style={{ height: '36px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                </div>
                <div style={{ background: status.color, padding: '3px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 700 }}>
                  {status.label}
                </div>
              </div>

              {/* Infos membre */}
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

              {/* Numéro + QR */}
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
            /* ── VERSO ── */
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
                {/* Statut */}
                <div style={{
                  background: status.bg, border: `1px solid ${status.color}30`,
                  borderRadius: '8px', padding: '7px 12px', marginBottom: '10px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span style={{ fontSize: '11px', color: status.color, fontWeight: 700 }}>Statut financier</span>
                  <span style={{ fontSize: '11px', color: status.color, fontWeight: 800 }}>{status.label}</span>
                </div>

                {/* Montants */}
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

                {/* Pied verso */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <img src={LOGO_CARD} alt="CoopACАFIS"
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

        {/* Flip */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <button onClick={() => setFlipped(!flipped)} style={{
            background: 'none', border: '1px solid #ede9e0',
            padding: '0.4rem 1.2rem', borderRadius: '20px',
            cursor: 'pointer', fontSize: '0.78rem', color: '#666', fontWeight: 600
          }}>
            🔄 {flipped ? 'Voir le recto' : 'Voir le verso'}
          </button>
        </div>

        {/* Actions */}
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

export default function Members() {
  const [members, setMembers]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState('');
  const [filterStatus, setFilterStatus]     = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [stats, setStats]                   = useState(null);

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

      {/* NAVBAR */}
      <nav style={{ background: '#1a3a6b', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={LOGO_NAV} alt="CoopACАFIS"
            style={{ height: '38px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>Module Membres</div>
        </div>
        <a href="/dashboard" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.82rem' }}>
          ← Dashboard
        </a>
      </nav>

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ color: '#1a3a6b', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>👥 Membres Acquéreurs</h1>
          <p style={{ color: '#8a8a8a', marginTop: '0.25rem' }}>Liste officielle AG — 46 membres — Cité Jardin Ndianda</p>
        </div>

        {/* STATS */}
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

        {/* FILTRES */}
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

        {/* TABLEAU */}
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
                        <button onClick={() => setSelectedMember(m)} style={{
                          background: '#1a3a6b', color: '#fff', border: 'none',
                          padding: '0.35rem 0.8rem', borderRadius: '6px',
                          cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700
                        }}>
                          🪪 Carte
                        </button>
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
    </div>
  );
}