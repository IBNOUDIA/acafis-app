import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Vote() {
  const { user }                  = useAuth();
  const navigate                  = useNavigate();
  const [votes, setVotes]         = useState([]);
  const [nextMeeting, setNextMeeting] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ title: '', description: '' });
  const [votingId, setVotingId]   = useState(null);
  const [message, setMessage]     = useState('');

  const isAdmin = ['super_admin', 'admin'].includes(user?.role);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const meetingRes = await api.get('/meetings/next');
      setNextMeeting(meetingRes.data.meeting);
      if (meetingRes.data.meeting) {
        const votesRes = await api.get(`/votes/meeting/${meetingRes.data.meeting._id}`);
        setVotes(votesRes.data.votes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVote = async (e) => {
    e.preventDefault();
    try {
      await api.post('/votes', { meetingId: nextMeeting._id, ...form });
      setShowForm(false);
      setForm({ title: '', description: '' });
      fetchData();
      setMessage('✅ Résolution créée avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Erreur lors de la création');
    }
  };

  const handleVote = async (voteId, choix) => {
    try {
      const res = await api.post(`/votes/${voteId}/voter`, { choix });
      setMessage(`✅ ${res.data.message}`);
      setTimeout(() => setMessage(''), 3000);
      fetchData();
      setVotingId(null);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || 'Erreur lors du vote'}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleFermer = async (voteId) => {
    try {
      const res = await api.put(`/votes/${voteId}/fermer`);
      setMessage(`✅ ${res.data.message}`);
      setTimeout(() => setMessage(''), 3000);
      fetchData();
    } catch (err) {
      setMessage('❌ Erreur lors de la fermeture');
    }
  };

  const hasVoted = (vote) =>
    vote.votes?.some(v => v.user?._id === user?._id || v.user === user?._id);

  const getPct = (val, total) =>
    total === 0 ? 0 : Math.round((val / total) * 100);

  const statusStyle = {
    ouverte:  { bg: '#eaf4ee', color: '#2d6a4f', label: '🟢 Ouvert' },
    fermée:   { bg: '#f5f5f5', color: '#666',    label: '🔒 Fermé' },
    adoptée:  { bg: '#eaf4ee', color: '#2d6a4f', label: '✅ Adoptée' },
    rejetée:  { bg: '#fdf0ee', color: '#c0392b', label: '❌ Rejetée' },
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
              🗳️ Système de Vote
            </h1>
            <p style={{ color: '#8a8a8a', marginTop: '0.25rem' }}>
              Votes en ligne — AG & CA ACAFIS
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {isAdmin && (
              <button onClick={() => setShowForm(true)} style={{
                background: '#c9973a', color: '#fff', border: 'none',
                padding: '0.5rem 1rem', borderRadius: '6px',
                cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'inherit',
              }}>
                + Nouvelle résolution
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

        {/* RÉUNION EN COURS */}
        {nextMeeting && (
          <div style={{
            background: '#1a3a6b', borderRadius: '12px', padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem', color: '#fff',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#c9973a', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                📅 Réunion associée
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{nextMeeting.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', marginTop: '0.2rem' }}>
                {new Date(nextMeeting.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} à {nextMeeting.time}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c9973a' }}>{votes.length}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Résolutions</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7effa0' }}>
                  {votes.filter(v => v.resolution.status === 'adoptée').length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Adoptées</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ff9a9a' }}>
                  {votes.filter(v => v.resolution.status === 'rejetée').length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Rejetées</div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8a8a8a' }}>⏳ Chargement...</div>
        ) : votes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗳️</div>
            <div style={{ color: '#1a3a6b', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Aucune résolution en cours
            </div>
            <div style={{ color: '#8a8a8a', fontSize: '0.88rem' }}>
              {isAdmin ? 'Cliquez sur "+ Nouvelle résolution" pour créer un vote.' : 'Les votes apparaîtront ici lorsque l\'administrateur en créera.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {votes.map((vote, i) => {
              const st      = statusStyle[vote.resolution.status] || statusStyle['fermée'];
              const voted   = hasVoted(vote);
              const total   = vote.results.total;
              const pctPour = getPct(vote.results.pour, total);
              const pctCon  = getPct(vote.results.contre, total);
              const pctAbs  = getPct(vote.results.abstention, total);
              const isOpen  = vote.resolution.status === 'ouverte';

              return (
                <div key={vote._id} style={{
                  background: '#fff', borderRadius: '12px', padding: '1.5rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  borderLeft: `5px solid ${isOpen ? '#2d6a4f' : '#8a8a8a'}`
                }}>
                  {/* En-tête résolution */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#8a8a8a', fontWeight: 600 }}>
                          Résolution #{i + 1}
                        </span>
                        <span style={{
                          background: st.bg, color: st.color,
                          padding: '0.15rem 0.6rem', borderRadius: '10px',
                          fontSize: '0.72rem', fontWeight: 700
                        }}>
                          {st.label}
                        </span>
                        {voted && isOpen && (
                          <span style={{ background: '#eef2f8', color: '#1a3a6b', padding: '0.15rem 0.6rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700 }}>
                            ✓ Voté
                          </span>
                        )}
                      </div>
                      <h3 style={{ color: '#1a3a6b', margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                        {vote.resolution.title}
                      </h3>
                      {vote.resolution.description && (
                        <p style={{ color: '#666', fontSize: '0.85rem', margin: '0.4rem 0 0', lineHeight: 1.6 }}>
                          {vote.resolution.description}
                        </p>
                      )}
                    </div>

                    {/* Actions admin */}
                    {isAdmin && isOpen && (
                      <button onClick={() => handleFermer(vote._id)} style={{
                        background: '#f8f5ef', color: '#c0392b', border: '1px solid #f5c6c0',
                        padding: '0.4rem 0.8rem', borderRadius: '6px',
                        cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                      }}>
                        🔒 Fermer le vote
                      </button>
                    )}
                  </div>

                  {/* Résultats */}
                  <div style={{ marginBottom: total > 0 ? '1.25rem' : '0' }}>
                    {total > 0 && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                          <span style={{ fontSize: '0.78rem', color: '#8a8a8a', fontWeight: 600 }}>
                            Résultats — {total} vote{total > 1 ? 's' : ''} exprimé{total > 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Barre Pour */}
                        <div style={{ marginBottom: '0.6rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.82rem', color: '#2d6a4f', fontWeight: 700 }}>✅ Pour</span>
                            <span style={{ fontSize: '0.82rem', color: '#2d6a4f', fontWeight: 700 }}>{vote.results.pour} ({pctPour}%)</span>
                          </div>
                          <div style={{ background: '#ede9e0', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                            <div style={{ background: '#2d6a4f', height: '100%', width: `${pctPour}%`, borderRadius: '4px', transition: 'width 0.5s' }} />
                          </div>
                        </div>

                        {/* Barre Contre */}
                        <div style={{ marginBottom: '0.6rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.82rem', color: '#c0392b', fontWeight: 700 }}>❌ Contre</span>
                            <span style={{ fontSize: '0.82rem', color: '#c0392b', fontWeight: 700 }}>{vote.results.contre} ({pctCon}%)</span>
                          </div>
                          <div style={{ background: '#ede9e0', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                            <div style={{ background: '#c0392b', height: '100%', width: `${pctCon}%`, borderRadius: '4px', transition: 'width 0.5s' }} />
                          </div>
                        </div>

                        {/* Barre Abstention */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.82rem', color: '#8a8a8a', fontWeight: 700 }}>⬜ Abstention</span>
                            <span style={{ fontSize: '0.82rem', color: '#8a8a8a', fontWeight: 700 }}>{vote.results.abstention} ({pctAbs}%)</span>
                          </div>
                          <div style={{ background: '#ede9e0', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                            <div style={{ background: '#8a8a8a', height: '100%', width: `${pctAbs}%`, borderRadius: '4px', transition: 'width 0.5s' }} />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Résultat final */}
                  {!isOpen && vote.results.resultat !== 'en_attente' && (
                    <div style={{
                      background: vote.results.resultat === 'adoptée' ? '#eaf4ee' : '#fdf0ee',
                      border: `1px solid ${vote.results.resultat === 'adoptée' ? '#2d6a4f' : '#c0392b'}30`,
                      borderRadius: '8px', padding: '0.75rem 1rem',
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>
                        {vote.results.resultat === 'adoptée' ? '✅' : '❌'}
                      </span>
                      <div>
                        <div style={{ fontWeight: 800, color: vote.results.resultat === 'adoptée' ? '#2d6a4f' : '#c0392b', fontSize: '0.95rem' }}>
                          Résolution {vote.results.resultat.toUpperCase()}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#666' }}>
                          {vote.results.pour} pour · {vote.results.contre} contre · {vote.results.abstention} abstention(s)
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Boutons de vote */}
                  {isOpen && !voted && votingId === vote._id && (
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                      {[
                        { choix: 'pour',        label: '✅ Pour',        bg: '#2d6a4f', color: '#fff' },
                        { choix: 'contre',      label: '❌ Contre',      bg: '#c0392b', color: '#fff' },
                        { choix: 'abstention',  label: '⬜ Abstention',  bg: '#f8f5ef', color: '#666' },
                      ].map(btn => (
                        <button key={btn.choix} onClick={() => handleVote(vote._id, btn.choix)} style={{
                          flex: 1, padding: '0.75rem', background: btn.bg, color: btn.color,
                          border: btn.choix === 'abstention' ? '1px solid #ede9e0' : 'none',
                          borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                          transition: 'opacity 0.2s'
                        }}>
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {isOpen && !voted && votingId !== vote._id && (
                    <button onClick={() => setVotingId(vote._id)} style={{
                      width: '100%', marginTop: '1rem', background: '#1a3a6b', color: '#fff',
                      border: 'none', padding: '0.75rem', borderRadius: '8px',
                      cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem'
                    }}>
                      🗳️ Voter sur cette résolution
                    </button>
                  )}

                  {isOpen && voted && (
                    <div style={{ marginTop: '1rem', textAlign: 'center', color: '#2d6a4f', fontSize: '0.85rem', fontWeight: 600 }}>
                      ✓ Vous avez déjà voté sur cette résolution
                    </div>
                  )}

                  {/* Qui a voté */}
                  {vote.votes?.length > 0 && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ede9e0' }}>
                      <div style={{ fontSize: '0.75rem', color: '#8a8a8a', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Votants ({vote.votes.length})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {vote.votes.map((v, j) => (
                          <div key={j} style={{
                            background: v.choix === 'pour' ? '#eaf4ee' : v.choix === 'contre' ? '#fdf0ee' : '#f5f5f5',
                            color: v.choix === 'pour' ? '#2d6a4f' : v.choix === 'contre' ? '#c0392b' : '#666',
                            padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 600
                          }}>
                            {v.user?.firstName} {v.user?.lastName?.[0]}.
                            {v.choix === 'pour' ? ' ✅' : v.choix === 'contre' ? ' ❌' : ' ⬜'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FORMULAIRE NOUVELLE RÉSOLUTION */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#1a3a6b', margin: 0 }}>🗳️ Nouvelle résolution</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#8a8a8a' }}>✕</button>
            </div>
            <form onSubmit={handleCreateVote}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Titre de la résolution *
                </label>
                <input type="text" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Approbation du rapport financier 2026"
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #ede9e0', borderRadius: '6px', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Description (optionnel)
                </label>
                <textarea value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Détails de la résolution..."
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #ede9e0', borderRadius: '6px', fontSize: '0.88rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
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
                }}>🗳️ Créer le vote</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
