import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Navbar from '../components/Navbar';

export default function ChangePassword() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = (fr, en, wo) => {
    if (i18n.language === 'en') return en;
    if (i18n.language === 'wo') return wo;
    return fr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError(t('Le nouveau mot de passe doit contenir au moins 6 caracteres', 'New password must be at least 6 characters', 'Mot de passe bi war na am 6 lettre yu tollook'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('Les deux mots de passe ne correspondent pas', 'Passwords do not match', 'Mot de passe yi wax na noo bokk'));
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || t('Erreur lors du changement de mot de passe', 'Error changing password', 'Am na njumte'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ef', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: '460px', margin: '3rem auto', padding: '0 1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: '14px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h1 style={{ color: '#1a3a6b', fontSize: '1.3rem', fontWeight: 700, marginTop: 0 }}>
            Changer mon mot de passe
          </h1>
          {success ? (
            <div style={{ background: '#e8f5e9', color: '#2d6a4f', padding: '1rem', borderRadius: '8px', textAlign: 'center', fontWeight: 600 }}>
              Mot de passe modifie avec succes !
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#666', marginBottom: '0.3rem', marginTop: '1rem' }}>Mot de passe actuel</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required style={inputStyle} />

              <label style={{ display: 'block', fontSize: '0.82rem', color: '#666', marginBottom: '0.3rem', marginTop: '1rem' }}>Nouveau mot de passe</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} style={inputStyle} />

              <label style={{ display: 'block', fontSize: '0.82rem', color: '#666', marginBottom: '0.3rem', marginTop: '1rem' }}>Confirmer le nouveau mot de passe</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={inputStyle} />

              {error && <div style={{ color: '#c0392b', fontSize: '0.82rem', marginTop: '0.75rem' }}>{error}</div>}

              <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1.5rem', background: '#1a3a6b', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Modification...' : 'Enregistrer'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
  border: '1px solid #ede9e0', fontSize: '0.9rem', boxSizing: 'border-box',
};
