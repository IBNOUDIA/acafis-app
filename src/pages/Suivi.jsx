import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const STATUS_LABELS = {
  a_faire: { label: 'À faire',  color: '#8a8a8a' },
  en_cours:{ label: 'En cours', color: '#c9973a' },
  termine: { label: 'Terminé',  color: '#2d6a4f' },
  bloque:  { label: 'Bloqué',   color: '#c0392b' },
};

const EMPTY_FORM = { title: '', phase: '', status: 'a_faire', responsible: '', dueDate: '' };

function TaskForm({ initial, onClose, onSuccess }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEdit = !!initial?._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/tasks/${initial._id}`, form);
      } else {
        await api.post('/tasks', form);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
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
          <h2 style={{ color: '#1a3a6b', margin: 0 }}>{isEdit ? '✏️ Modifier' : '+ Ajouter'} une tâche</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#8a8a8a' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.35rem' }}>Titre *</label>
            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #ede9e0', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.35rem' }}>Phase / Catégorie</label>
            <input value={form.phase} onChange={e => setForm({ ...form, phase: e.target.value })}
              placeholder="Ex: Ndianda - Construction, Finance, Juridique..."
              style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #ede9e0', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.35rem' }}>Statut</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #ede9e0', borderRadius: '6px' }}>
                {Object.entries(STATUS_LABELS).map(([val, s]) => (
                  <option key={val} value={val}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.35rem' }}>Échéance</label>
              <input type="date" value={form.dueDate ? form.dueDate.slice(0, 10) : ''} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', border: '1.5px solid #ede9e0', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a3a6b', marginBottom: '0.35rem' }}>Responsable</label>
            <input value={form.responsible} onChange={e => setForm({ ...form, responsible: e.target.value })}
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

function NotesPanel({ task, onClose, onChanged }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(task.notes || []);

  const addNote = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await api.post(`/tasks/${task._id}/notes`, { text });
      setNotes(res.data.task.notes);
      setText('');
      onChanged();
    } catch (err) {
      console.error(err);
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
      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '500px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ color: '#1a3a6b', margin: 0, fontSize: '1rem' }}>📝 {task.title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#8a8a8a' }}>✕</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, marginBottom: '1rem' }}>
          {notes.length === 0 ? (
            <p style={{ color: '#8a8a8a', fontSize: '0.82rem', textAlign: 'center' }}>Aucune note pour l'instant.</p>
          ) : (
            [...notes].reverse().map((n, i) => (
              <div key={n._id || i} style={{ padding: '0.6rem 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: '0.85rem', color: '#333' }}>{n.text}</div>
                <div style={{ fontSize: '0.7rem', color: '#8a8a8a', marginTop: '0.2rem' }}>
                  {n.author || 'Inconnu'} · {new Date(n.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={addNote} style={{ display: 'flex', gap: '0.5rem' }}>
          <input value={text} onChange={e => setText(e.target.value)}
            placeholder="Ajouter une note de suivi..."
            style={{ flex: 1, padding: '0.6rem', border: '1.5px solid #ede9e0', borderRadius: '6px' }} />
          <button type="submit" disabled={loading || !text.trim()} style={{
            background: '#1a3a6b', color: '#fff', border: 'none',
            padding: '0.6rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700,
            opacity: loading || !text.trim() ? 0.6 : 1,
          }}>Ajouter</button>
        </form>
      </div>
    </div>
  );
}

export default function Suivi() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [notesTask, setNotesTask] = useState(null);
  const [phaseFilter, setPhaseFilter] = useState('');
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (task, status) => {
    try {
      await api.put(`/tasks/${task._id}`, { status });
      setTasks(ts => ts.map(t => t._id === task._id ? { ...t, status } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchive = async (task) => {
    if (!window.confirm(`Archiver "${task.title}" ?`)) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      setMessage('✅ Tâche archivée');
      setTimeout(() => setMessage(''), 3000);
      fetchData();
    } catch (err) {
      setMessage('❌ Erreur lors de l\'archivage');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const phases = [...new Set(tasks.map(t => t.phase).filter(Boolean))];
  const filtered = phaseFilter ? tasks.filter(t => t.phase === phaseFilter) : tasks;

  const counts = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ef', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: '#1a3a6b', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>📊 Suivi de l'avancement</h1>
            <p style={{ color: '#8a8a8a', marginTop: '0.25rem' }}>Grille de suivi des tâches — Ndianda & dossiers du CA</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => { setEditing(null); setShowForm(true); }} style={{
              background: '#c9973a', color: '#fff', border: 'none',
              padding: '0.5rem 1.1rem', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 700, fontFamily: 'inherit',
            }}>
              + Ajouter une tâche
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

        {/* RESUME PAR STATUT */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {Object.entries(STATUS_LABELS).map(([key, s]) => (
            <div key={key} style={{ background: '#fff', borderRadius: '10px', padding: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: `4px solid ${s.color}` }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: s.color }}>{counts[key] || 0}</div>
              <div style={{ fontSize: '0.75rem', color: '#8a8a8a' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* FILTRE PHASE */}
        {phases.length > 0 && (
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#8a8a8a', fontWeight: 600 }}>Filtrer :</span>
            <button onClick={() => setPhaseFilter('')} style={{
              background: phaseFilter === '' ? '#1a3a6b' : '#fff', color: phaseFilter === '' ? '#fff' : '#1a3a6b',
              border: '1px solid #1a3a6b', padding: '0.3rem 0.8rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
            }}>Toutes</button>
            {phases.map(p => (
              <button key={p} onClick={() => setPhaseFilter(p)} style={{
                background: phaseFilter === p ? '#1a3a6b' : '#fff', color: phaseFilter === p ? '#fff' : '#1a3a6b',
                border: '1px solid #1a3a6b', padding: '0.3rem 0.8rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
              }}>{p}</button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8a8a8a' }}>⏳ Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '10px', padding: '2rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p style={{ color: '#8a8a8a' }}>Aucune tâche pour le moment. Ajoutez-en une pour commencer le suivi.</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ background: '#1a3a6b' }}>
                  {['Phase', 'Titre', 'Statut', 'Responsable', 'Échéance', 'Notes', ''].map(h => (
                    <th key={h} style={{ padding: '0.85rem 1rem', color: '#fff', fontSize: '0.78rem', fontWeight: 700, textAlign: 'left', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={t._id} style={{ background: i % 2 === 0 ? '#f8f5ef' : '#fff', borderBottom: '1px solid #ede9e0' }}>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#666' }}>{t.phase || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: '#1a3a6b', cursor: 'pointer' }} onClick={() => { setEditing(t); setShowForm(true); }}>
                      {t.title}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <select value={t.status} onChange={e => updateStatus(t, e.target.value)} style={{
                        background: STATUS_LABELS[t.status].color + '15', color: STATUS_LABELS[t.status].color,
                        border: `1px solid ${STATUS_LABELS[t.status].color}60`, borderRadius: '20px',
                        padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                      }}>
                        {Object.entries(STATUS_LABELS).map(([val, s]) => (
                          <option key={val} value={val}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#333' }}>{t.responsible || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#666' }}>
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <button onClick={() => setNotesTask(t)} style={{
                        background: 'none', border: '1px solid #ede9e0', color: '#1a3a6b',
                        padding: '0.25rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                      }}>
                        📝 {t.notes?.length || 0}
                      </button>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <button onClick={() => handleArchive(t)} style={{
                        background: '#fdf0ee', color: '#c0392b', border: 'none',
                        padding: '0.3rem 0.55rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700,
                      }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <TaskForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            fetchData();
            setMessage(editing ? '✅ Tâche mise à jour' : '✅ Tâche ajoutée');
            setTimeout(() => setMessage(''), 3000);
          }}
        />
      )}

      {notesTask && (
        <NotesPanel
          task={notesTask}
          onClose={() => { setNotesTask(null); fetchData(); }}
          onChanged={fetchData}
        />
      )}
    </div>
  );
}
