import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LOGO_LOGIN } from '../assets/logo';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a3a6b 0%, #2e5090 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", padding: '1rem'
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '2.5rem',
        width: '100%', maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src={LOGO_LOGIN}
            alt="CoopACАFIS"
            style={{ height: '90px', objectFit: 'contain', marginBottom: '0.75rem' }}
          />
          <p style={{ color: '#8a8a8a', fontSize: '0.85rem', margin: 0 }}>
            Application de Gestion CA
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#1a3a6b', marginBottom: '0.4rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Courriel
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              style={{
                width: '100%', padding: '0.75rem 1rem',
                border: '1.5px solid #ede9e0', borderRadius: '6px',
                fontSize: '0.9rem', outline: 'none',
                transition: 'border-color 0.2s', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#1a3a6b'}
              onBlur={e => e.target.style.borderColor = '#ede9e0'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#1a3a6b', marginBottom: '0.4rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '0.75rem 1rem',
                border: '1.5px solid #ede9e0', borderRadius: '6px',
                fontSize: '0.9rem', outline: 'none',
                transition: 'border-color 0.2s', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#1a3a6b'}
              onBlur={e => e.target.style.borderColor = '#ede9e0'}
            />
          </div>

          {error && (
            <div style={{
              background: '#fdf0ee', border: '1px solid #f5c6c0',
              borderRadius: '6px', padding: '0.75rem 1rem',
              color: '#c0392b', fontSize: '0.85rem', marginBottom: '1rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.85rem',
              background: loading ? '#8a8a8a' : '#1a3a6b',
              color: '#fff', border: 'none', borderRadius: '6px',
              fontSize: '0.9rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s', letterSpacing: '0.04em'
            }}
          >
            {loading ? '⏳ Connexion...' : '🔐 Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#8a8a8a', fontSize: '0.78rem', marginTop: '1.5rem' }}>
          COOP-ACAFIS © 2026 — Accès réservé aux membres CA
        </p>
      </div>
    </div>
  );
}