import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';

const ROLE_LABELS = {
  president:          '🎖️ Président',
  vice_president:     '🎖️ Vice-Président',
  secretaire_general: '📋 Secrétaire Général',
  secretaire_adjoint: '📋 Secrétaire Adjoint',
  tresoriere:         '💰 Trésorière',
  tresorier_adjoint:  '💰 Trésorier Adjoint',
  administrateur:     '🧑‍💼 Administrateur',
};

const COMMISSION_LABELS = {
  habitat:       { label: '🏗️ Habitat',       color: '#2d6a4f' },
  finance:       { label: '💰 Finance',        color: '#c9973a' },
  communication: { label: '📢 Communication',  color: '#1a3a6b' },
  juridique:     { label: '⚖️ Juridique',      color: '#4a1942' },
};

const EMPTY_FORM = {
  firstName: '', lastName: '', role: 'administrateur',
  commissions: [], email: '', phone: '', linkedinUrl: '',
};

function MemberForm({ initial, onClose, onSuccess }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEdit = !!initial?._id;

  const toggleCommission = (c) => {
    setForm(f => ({
      ...f,
      commissions: f.commissions.includes(c)
        ? f.commissions.filter(x => x !== c)
        : [...f.commissions, c],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/board/${initial._id}`, form);
      } else {
        await api.post('/board', form);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
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
          <h2 style={{ color: '#1a3a6b', margin: 0 }}>{isEdit ? '✏️ Modifier' : '+ Ajouter'} un membre du bureau</h2>
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
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.35rem' }}>Poste *</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #ede9e0', borderRadius: '6px' }}>
              {Object.entries(ROLE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.5rem' }}>Commission(s)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {Object.entries(COMMISSION_LABELS).map(([val, c]) => (
                <button key={val} type="button" onClick={() => toggleCommission(val)} style={{
                  padding: '0.5rem', border: '2px solid',
                  borderColor: form.commissions.includes(val) ? c.color : '#ede9e0',
                  borderRadius: '8px', cursor: 'pointer',
                  background: form.commissions.includes(val) ? c.color + '15' : '#fff',
                  fontSize: '0.78rem', fontWeight: 600, color: c.color,
                }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.35rem' }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #ede9e0', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.35rem' }}>Téléphone</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #ede9e0', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.35rem' }}>Lien LinkedIn</label>
            <input value={form.linkedinUrl} onChange={e => setForm({ ...form, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/..."
              style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #ede9e0', borderRadius: '6px', boxSizing: 'border-box' }} />
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
            }}>{loading ? 'Enregistrement...' : '✅ Enregistrer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignAcquereurPanel({ commissionKey, commissionLabel, onClose, onChanged }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/members?limit=200${search ? `&search=${encodeURIComponent(search)}` : ''}`);
        if (active) setResults(res.data.members);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => { active = false; };
  }, [search]);

  const toggle = async (member) => {
    const current = member.commissions || [];
    const updated = current.includes(commissionKey)
      ? current.filter(c => c !== commissionKey)
      : [...current, commissionKey];
    try {
      await api.put(`/members/${member._id}`, { commissions: updated });
      setResults(rs => rs.map(r => r._id === member._id ? { ...r, commissions: updated } : r));
      onChanged();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '440px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ color: '#1a3a6b', margin: 0, fontSize: '1rem' }}>Assigner à {commissionLabel}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#8a8a8a' }}>✕</button>
        </div>
        <input type="text" placeholder="🔍 Rechercher un acquéreur..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '0.6rem 0.8rem', border: '1.5px solid #ede9e0', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', marginBottom: '1rem' }} />
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <p style={{ color: '#8a8a8a', fontSize: '0.82rem', textAlign: 'center' }}>Chargement...</p>
          ) : results.length === 0 ? (
            <p style={{ color: '#8a8a8a', fontSize: '0.82rem', textAlign: 'center' }}>Aucun acquéreur trouvé.</p>
          ) : (
            results.map(m => {
              const assigned = m.commissions?.includes(commissionKey);
              return (
                <div key={m._id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.5rem 0.25rem', borderBottom: '1px solid #f0f0f0',
                }}>
                  <span style={{ fontSize: '0.85rem', color: '#333' }}>{m.firstName} {m.lastName}</span>
                  <button onClick={() => toggle(m)} style={{
                    background: assigned ? '#fdf0ee' : '#eaf4ee',
                    color: assigned ? '#c0392b' : '#2d6a4f',
                    border: 'none', padding: '0.3rem 0.7rem', borderRadius: '6px',
                    cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700,
                  }}>
                    {assigned ? '− Retirer' : '+ Ajouter'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function MemberCard({ member, isAdmin, onEdit, onDelete }) {
  const initials = `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase();
  return (
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '1.25rem',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '46px', height: '46px', borderRadius: '50%', flexShrink: 0,
          background: '#1a3a6b', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#c9973a', fontWeight: 800, fontSize: '0.95rem',
        }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: '#1a3a6b', fontSize: '0.95rem' }}>
            {member.firstName} {member.lastName}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#8a8a8a' }}>{ROLE_LABELS[member.role]}</div>
        </div>
      </div>

      {member.commissions?.length > 0 && (
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {member.commissions.map(c => (
            <span key={c} style={{
              background: COMMISSION_LABELS[c].color + '15', color: COMMISSION_LABELS[c].color,
              padding: '0.15rem 0.55rem', borderRadius: '10px', fontSize: '0.68rem', fontWeight: 700,
            }}>
              {COMMISSION_LABELS[c].label}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #ede9e0' }}>
        {member.linkedinUrl ? (
          <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            color: '#0A66C2', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none',
          }}>
            🔗 LinkedIn
          </a>
        ) : <span />}
        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button onClick={() => onEdit(member)} style={{
              background: '#fdf5e6', color: '#c9973a', border: 'none',
              padding: '0.3rem 0.55rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700,
            }}>✏️</button>
            <button onClick={() => onDelete(member)} style={{
              background: '#fdf0ee', color: '#c0392b', border: 'none',
              padding: '0.3rem 0.55rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700,
            }}>🗑️</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Bureau() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = ['super_admin', 'admin'].includes(user?.role);

  const [members, setMembers] = useState([]);
  const [acquereurs, setAcquereurs] = useState([]); // 🔑 nouveau
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [assigningCommission, setAssigningCommission] = useState(null); // 🔑 nouveau
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const [boardRes, membersRes] = await Promise.all([
        api.get('/board'),
        api.get('/members?limit=200'),
      ]);
      setMembers(boardRes.data.members);
      setAcquereurs(membersRes.data.members);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (member) => {
    if (!window.confirm(`Retirer ${member.firstName} ${member.lastName} du bureau ?`)) return;
    try {
      await api.delete(`/board/${member._id}`);
      setMessage('✅ Membre retiré du bureau');
      setTimeout(() => setMessage(''), 3000);
      fetchData();
    } catch (err) {
      setMessage('❌ Erreur lors du retrait');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const EXECUTIFS = ['president', 'vice_president', 'secretaire_general', 'secretaire_adjoint', 'tresoriere', 'tresorier_adjoint'];
  const bureau = members.filter(m => EXECUTIFS.includes(m.role))
    .sort((a, b) => EXECUTIFS.indexOf(a.role) - EXECUTIFS.indexOf(b.role));
  const administrateurs = members.filter(m => m.role === 'administrateur');

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ef', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: '#1a3a6b', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>🏛️ Bureau & Commissions</h1>
            <p style={{ color: '#8a8a8a', marginTop: '0.25rem' }}>Composition du Conseil d'Administration ACAFIS</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {isAdmin && (
              <button onClick={() => { setEditing(null); setShowForm(true); }} style={{
                background: '#c9973a', color: '#fff', border: 'none',
                padding: '0.5rem 1.1rem', borderRadius: '8px', cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: 700, fontFamily: 'inherit',
              }}>
                + Ajouter un membre
              </button>
            )}
            <button onClick={() => navigate('/dashboard')} style={{
              background: 'none', border: '1px solid #ede9e0', color: '#1a3a6b',
              padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit',
            }}>
              ← Dashboard
            </button>
          </div>
        </div>

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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8a8a8a' }}>⏳ Chargement...</div>
        ) : (
          <>
            {/* BUREAU EXÉCUTIF */}
            <h2 style={{ color: '#1a3a6b', fontSize: '1.1rem', marginBottom: '1rem' }}>🎖️ Bureau exécutif</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {bureau.map(m => (
                <MemberCard key={m._id} member={m} isAdmin={isAdmin} onEdit={(mem) => { setEditing(mem); setShowForm(true); }} onDelete={handleDelete} />
              ))}
            </div>

            {/* ADMINISTRATEURS (sans poste exécutif) */}
            {administrateurs.length > 0 && (
              <>
                <h2 style={{ color: '#1a3a6b', fontSize: '1.1rem', marginBottom: '1rem' }}>🧑‍💼 Administrateurs</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {administrateurs.map(m => (
                    <MemberCard key={m._id} member={m} isAdmin={isAdmin} onEdit={(mem) => { setEditing(mem); setShowForm(true); }} onDelete={handleDelete} />
                  ))}
                </div>
              </>
            )}

            {/* COMMISSIONS — fusion bureau + acquéreurs assignés */}
            <h2 style={{ color: '#1a3a6b', fontSize: '1.1rem', marginBottom: '1rem' }}>📁 Commissions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {Object.entries(COMMISSION_LABELS).map(([key, c]) => {
                const membresBureau = members.filter(m => m.commissions?.includes(key))
                  .map(m => ({ ...m, _source: 'bureau' }));
                const membresAcquereurs = acquereurs.filter(m => m.commissions?.includes(key))
                  .map(m => ({ ...m, _source: 'acquereur' }));
                const tous = [...membresBureau, ...membresAcquereurs];
                return (
                  <div key={key} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `4px solid ${c.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <h3 style={{ margin: 0, color: c.color, fontSize: '0.95rem' }}>{c.label}</h3>
                      <span style={{ background: c.color + '15', color: c.color, padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700 }}>
                        {tous.length} / 5 membres
                      </span>
                    </div>
                    {tous.length === 0 ? (
                      <p style={{ color: '#8a8a8a', fontSize: '0.78rem', fontStyle: 'italic' }}>Aucun membre assigné pour le moment.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.85rem' }}>
                        {tous.map(m => (
                          <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                            <span style={{ color: '#333', fontWeight: 600 }}>
                              {m.firstName} {m.lastName}
                              {m._source === 'bureau' && <span style={{ color: '#8a8a8a', fontWeight: 400 }}> · bureau</span>}
                            </span>
                            {m.linkedinUrl && (
                              <a href={m.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0A66C2', fontSize: '0.75rem', textDecoration: 'none' }}>🔗</a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {isAdmin && (
                      <button onClick={() => setAssigningCommission(key)} style={{
                        width: '100%', background: '#f8f5ef', color: c.color, border: `1px dashed ${c.color}60`,
                        padding: '0.45rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
                      }}>
                        + Assigner un acquéreur
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {showForm && (
        <MemberForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            fetchData();
            setMessage(editing ? '✅ Membre mis à jour' : '✅ Membre ajouté au bureau');
            setTimeout(() => setMessage(''), 3000);
          }}
        />
      )}

      {assigningCommission && (
        <AssignAcquereurPanel
          commissionKey={assigningCommission}
          commissionLabel={COMMISSION_LABELS[assigningCommission].label}
          onClose={() => setAssigningCommission(null)}
          onChanged={fetchData}
        />
      )}
    </div>
  );
}