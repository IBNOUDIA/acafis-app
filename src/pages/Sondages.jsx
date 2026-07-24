import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Sondages() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [polls, setPolls]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ question: '', options: ['', ''] });
  const [message, setMessage]   = useState('');

  const isAdmin = ['super_admin', 'admin'].includes(user?.role);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/polls');
      setPolls(res.data.polls);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const cleanOptions = form.options.map(o => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      setMessage('❌ Il faut au moins 2 options');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    try {
      await api.post('/polls', { question: form.question, options: cleanOptions });
      setShowForm(false);
      setForm({ question: '', options: ['', ''] });
      fetchData();
      setMessage('✅ Sondage créé avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Erreur lors de la création');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleVote = async (pollId, optionIndex) => {
    try {
      await api.post(`/polls/${pollId}/vote`, { optionIndex });
      fetchData();
      setMessage('✅ Vote enregistré !');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || 'Erreur lors du vote'}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleClose = async (pollId) => {
    try {
      await api.put(`/polls/${pollId}/fermer`);
      fetchData();
      setMessage('✅ Sondage fermé');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('❌ Erreur');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (pollId) => {
    if (!window.confirm('Supprimer ce sondage ?')) return;
    try {
      await api.delete(`/polls/${pollId}`);
      fetchData();
    } catch (err) {
      setMessage('❌ Erreur lors de la suppression');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const addOptionField = () => setForm({ ...form, options: [...form.options, ''] });
  const updateOption = (i, val) => {
    const opts = [...form.options];
    opts[i] = val;
    setForm({ ...form, options: opts });
  };
  const removeOption = (i) => {
    if (form.options.length <= 2) return;
    setForm({ ...form, options: form.options.filter((_, idx) => idx !== i) });
  };

  const getTotal = (poll) => poll.options.reduce((sum, o) => sum + o.votes, 0);
  const getPct = (votes, total) => (total === 0 ? 0 : Math.round((votes / total) * 100));

  const barColors = ['#2d6a4f', '#1a3a6b', '#c9973a', '#4a1942', '#023e8a', '#c0392b'];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ef', fontFamily: "'DM Sans', sans-serif" }}>

      <Navbar />

      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: '#1a3a6b', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>
              📊 Sondages
            </h1>
            <p style={{ color: '#8a8a8a', marginTop: '0.25rem' }}>
              Questions rapides — réponses anonymes, sans limite
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {isAdmin && (
              <button onClick={() => setShowForm(true)} style={{
                background: '#c9973a', color: '#fff', border: 'none',
                padding: '0.5rem 1rem', borderRadius: '6px',
                cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'inherit',
              }}>
                + Nouveau sondage
              </button>
            )}
            <button onClick={() => navigate('/dashboard')} style={{
              background: 'none', border: '1px solid #ede9e0', color: '#1a3a6b',
              padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer',
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
            padding: '0.85rem 1.25rem', borderRadius: '8px',
            marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.88rem'
          }}>
            {message}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8a8a8a' }}>⏳ Chargement...</div>
        ) : polls.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <div style={{ color: '#1a3a6b', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Aucun sondage pour l'instant
            </div>
            <div style={{ color: '#8a8a8a', fontSize: '0.88rem' }}>
              {isAdmin ? 'Cliquez sur "+ Nouveau sondage" pour en créer un.' : 'Les sondages apparaîtront ici.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {polls.map((poll) => {
              const total = getTotal(poll);
              const isOpen = poll.status === 'ouvert';

              return (
                <div key={poll._id} style={{
                  background: '#fff', borderRadius: '12px', padding: '1.5rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  borderLeft: `5px solid ${isOpen ? '#2d6a4f' : '#8a8a8a'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{
                        background: isOpen ? '#eaf4ee' : '#f5f5f5',
                        color: isOpen ? '#2d6a4f' : '#666',
                        padding: '0.15rem 0.6rem', borderRadius: '10px',
                        fontSize: '0.72rem', fontWeight: 700
                      }}>
                        {isOpen ? '🟢 Ouvert' : '🔒 Fermé'}
                      </span>
                      <h3 style={{ color: '#1a3a6b', margin: '0.5rem 0 0', fontSize: '1.05rem', fontWeight: 700 }}>
                        {poll.question}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: '#8a8a8a', marginTop: '0.25rem' }}>
                        {total} vote{total > 1 ? 's' : ''} exprimé{total > 1 ? 's' : ''}
                      </div>
                    </div>
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {isOpen && (
                          <button onClick={() => handleClose(poll._id)} style={{
                            background: '#f8f5ef', color: '#c0392b', border: '1px solid #f5c6c0',
                            padding: '0.35rem 0.7rem', borderRadius: '6px',
                            cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700
                          }}>
                            🔒 Fermer
                          </button>
                        )}
                        <button onClick={() => handleDelete(poll._id)} style={{
                          background: '#fdf0ee', color: '#c0392b', border: 'none',
                          padding: '0.35rem 0.6rem', borderRadius: '6px',
                          cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700
                        }}>
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {poll.options.map((opt, i) => {
                      const pct = getPct(opt.votes, total);
                      const color = barColors[i % barColors.length];
                      return (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#333', fontWeight: 600 }}>{opt.text}</span>
                            <span style={{ fontSize: '0.85rem', color, fontWeight: 700 }}>{opt.votes} ({pct}%)</span>
                          </div>
                          <div style={{ background: '#ede9e0', borderRadius: '4px', height: '10px', overflow: 'hidden', marginBottom: '0.3rem' }}>
                            <div style={{ background: color, height: '100%', width: `${pct}%`, borderRadius: '4px', transition: 'width 0.5s' }} />
                          </div>
                          {isOpen && (
                            <button onClick={() => handleVote(poll._id, i)} style={{
                              width: '100%', padding: '0.4rem', background: '#f8f5ef',
                              border: '1px solid #ede9e0', borderRadius: '6px',
                              cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: '#1a3a6b'
                            }}>
                              Voter pour cette option
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#1a3a6b', margin: 0 }}>📊 Nouveau sondage</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#8a8a8a' }}>✕</button>
            </div>
            <form onSubmit={handleCreatePoll}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.4rem' }}>
                  Question *
                </label>
                <input type="text" value={form.question}
                  onChange={e => setForm({ ...form, question: e.target.value })}
                  placeholder="Ex: Préférez-vous la réunion en matinée ou après-midi ?"
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #ede9e0', borderRadius: '6px', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.4rem' }}>
                  Options de réponse *
                </label>
                {form.options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input type="text" value={opt}
                      onChange={e => updateOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      style={{ flex: 1, padding: '0.6rem', border: '1.5px solid #ede9e0', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                    {form.options.length > 2 && (
                      <button type="button" onClick={() => removeOption(i)} style={{
                        background: '#fdf0ee', color: '#c0392b', border: 'none',
                        borderRadius: '6px', width: '36px', cursor: 'pointer', fontWeight: 700
                      }}>✕</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addOptionField} style={{
                  background: 'none', border: '1px dashed #c9973a', color: '#c9973a',
                  padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: 700, marginTop: '0.25rem'
                }}>
                  + Ajouter une option
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  flex: 1, padding: '0.75rem', background: '#f8f5ef',
                  border: '1px solid #ede9e0', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#666'
                }}>Annuler</button>
                <button type="submit" style={{
                  flex: 2, padding: '0.75rem', background: '#1a3a6b',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#fff'
                }}>📊 Créer le sondage</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}