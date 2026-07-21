import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const PHASES = [
  {
    numero: 1, titre: 'Études et planification', statut: 'terminée',
    periode: '2018 — 2021', progress: 100,
    description: 'Création de l\'ACAFIS, études de faisabilité, choix du terrain à Nguéniène.',
    activites: [
      'Création de l\'ACAFIS (2018)',
      'Études de faisabilité du projet',
      'Identification et acquisition du terrain à Nguéniène',
      'Constitution du panel des 46 acquéreurs',
      'Partenariat avec BHS pour le financement',
    ]
  },
  {
    numero: 2, titre: 'Conception architecturale', statut: 'en_cours',
    periode: '2022 — 2026', progress: 65,
    description: 'Développement des plans architecturaux avec Studio SAAMS et ingénierie avec Ridwan Engineering.',
    activites: [
      'Signature contrat Studio Architecture Amadou M. SAR',
      'Plans préliminaires des 320 logements ✅',
      'Validation des plans par le CA ✅',
      'Études d\'ingénierie — Ridwan Engineering (en cours)',
      'Permis de construire — en cours',
    ]
  },
  {
    numero: 3, titre: 'Financement et montage', statut: 'en_cours',
    periode: '2024 — 2026', progress: 45,
    description: 'Consolidation du financement BHS et collecte des cotisations des acquéreurs.',
    activites: [
      'Compte BHS ouvert — Solde : 3 817 410 FCFA ✅',
      'Cotisations 2024-2025 en cours de collecte',
      'Négociation conditions de prêt BHS',
      'Montage financier final — en attente',
      'Signature accords de financement — à venir',
    ]
  },
  {
    numero: 4, titre: 'Construction', statut: 'planifiée',
    periode: '2026 — 2028', progress: 0,
    description: 'Démarrage des travaux de construction des 320 logements à Nguéniène, Sénégal.',
    activites: [
      'Appel d\'offres construction',
      'Sélection entrepreneur général',
      'Démarrage des travaux',
      'Construction Phase 1 — 80 logements',
      'Construction Phase 2 — 240 logements',
    ]
  },
  {
    numero: 5, titre: 'Livraison', statut: 'planifiée',
    periode: '2028 — 2030', progress: 0,
    description: 'Livraison progressive des logements aux acquéreurs.',
    activites: [
      'Inspection et réception des travaux',
      'Attribution des logements aux acquéreurs',
      'Livraison Phase 1 — 80 logements (2028)',
      'Livraison Phase 2 — 240 logements (2029-2030)',
      'Remise des titres de propriété',
    ]
  },
];

const PARTENAIRES = [
  { nom: 'Studio SAAMS', role: 'Architecture', icon: '🏛️', contact: 'Studio Architecture Amadou M. SAR', statut: 'Actif' },
  { nom: 'Ridwan Engineering', role: 'Construction & Ingénierie', icon: '🔧', contact: 'Ridwan Engineering', statut: 'Actif' },
  { nom: 'BHS', role: 'Financement', icon: '🏦', contact: 'Banque de l\'Habitat du Sénégal', statut: 'Actif' },
  { nom: 'Afro Immobilier', role: 'Agent immobilier', icon: '🏘️', contact: 'Wilfried Ouedraogo', statut: 'Actif' },
];

const LOGEMENTS = [
  { type: 'Villa F3 RDC',  surface: '85m²',  prix: '87 000 000 FCFA',  icon: '🏡', nb: 40 },
  { type: 'Villa F4 RDC',  surface: '110m²', prix: '115 000 000 FCFA', icon: '🏡', nb: 80 },
  { type: 'Villa F5 R+1',  surface: '140m²', prix: '155 000 000 FCFA', icon: '🏠', nb: 100 },
  { type: 'Villa F5 R+2',  surface: '160m²', prix: '175 000 000 FCFA', icon: '🏠', nb: 60 },
  { type: 'Villa F6 R+2',  surface: '200m²', prix: '225 000 000 FCFA', icon: '🏰', nb: 40 },
];

const statusConfig = {
  terminée:   { color: '#2d6a4f', bg: '#eaf4ee', label: '✅ Terminée' },
  en_cours:   { color: '#c9973a', bg: '#fdf5e6', label: '🔄 En cours' },
  planifiée:  { color: '#8a8a8a', bg: '#f5f5f5', label: '📅 Planifiée' },
};

export default function Ndianda() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('apercu');

  const tabs = [
    { id: 'apercu',      label: '🏗️ Aperçu' },
    { id: 'phases',      label: '📅 Phases' },
    { id: 'logements',   label: '🏡 Logements' },
    { id: 'partenaires', label: '🤝 Partenaires' },
    { id: 'finances',    label: '💰 Finances' },
  ];

  const progressGlobal = Math.round(
    PHASES.reduce((acc, p) => acc + p.progress, 0) / PHASES.length
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ef', fontFamily: "'DM Sans', sans-serif" }}>

      {/* 🔑 Navbar partagée — hamburger, langue, déconnexion, lien mot de passe */}
      <Navbar />

      {/* HERO */}
      <div style={{
        background: 'linear-gradient(135deg, #1a3a6b 0%, #2d6a4f 100%)',
        padding: '2.5rem 2rem', color: '#fff', textAlign: 'center', position: 'relative'
      }}>
        {/* 🔑 navigate() au lieu de <a href> */}
        <button onClick={() => navigate('/dashboard')} style={{
          position: 'absolute', top: '1rem', right: '1.5rem',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)',
          color: '#fff', padding: '0.4rem 0.9rem', borderRadius: '6px',
          cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit',
        }}>
          ← Dashboard
        </button>

        <div style={{ fontSize: '0.72rem', color: '#c9973a', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          🇸🇳 Nguéniène, Sénégal
        </div>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: 800 }}>
          Cité Jardin Ndianda
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', margin: '0 0 2rem', fontSize: '1rem' }}>
          320 logements — Coopérative d'Habitat ACAFIS
        </p>

        {/* Stats hero */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {[
            { icon: '🏘️', value: '320',     label: 'Logements' },
            { icon: '👥', value: '46',      label: 'Acquéreurs' },
            { icon: '📐', value: '15 ha',   label: 'Superficie' },
            { icon: '📅', value: '2030',    label: 'Livraison' },
            { icon: '🏦', value: '3.8M FCFA', label: 'Compte BHS' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#c9973a' }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress global */}
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>Avancement global</span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#c9973a' }}>{progressGlobal}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(90deg, #c9973a, #f0c060)', height: '100%', width: `${progressGlobal}%`, borderRadius: '6px', transition: 'width 1s ease' }} />
          </div>
        </div>
      </div>

      <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>

        {/* ONGLETS */}
        <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '2px solid #ede9e0', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0.75rem 1.25rem', fontSize: '0.82rem', fontWeight: 600,
              color: activeTab === tab.id ? '#1a3a6b' : '#8a8a8a',
              borderBottom: activeTab === tab.id ? '3px solid #c9973a' : '3px solid transparent',
              marginBottom: '-2px', whiteSpace: 'nowrap'
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* APERÇU */}
        {activeTab === 'apercu' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ color: '#1a3a6b', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>
                  📍 Localisation
                </h3>
                <div style={{ background: '#f8f5ef', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#333', lineHeight: 1.7 }}>
                    <div>🇸🇳 <strong>Nguéniène</strong>, Sénégal</div>
                    <div>📍 Région de Kaolack</div>
                    <div>🏘️ Superficie : ~15 hectares</div>
                    <div>🛣️ Accès routes principales</div>
                  </div>
                </div>
                <a href="https://maps.google.com/?q=Nguéniène+Sénégal" target="_blank" rel="noreferrer" style={{
                  display: 'block', textAlign: 'center', background: '#1a3a6b', color: '#fff',
                  padding: '0.6rem', borderRadius: '8px', textDecoration: 'none',
                  fontSize: '0.82rem', fontWeight: 700
                }}>
                  📍 Voir sur Google Maps
                </a>
              </div>

              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ color: '#1a3a6b', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>
                  🎯 Objectifs du projet
                </h3>
                {[
                  'Offrir des logements abordables aux membres ACAFIS',
                  'Favoriser le retour au Sénégal de la diaspora',
                  'Créer un environnement résidentiel moderne',
                  'Développer un modèle coopératif d\'habitat',
                  'Contribuer au développement de Nguéniène',
                ].map((obj, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.6rem', padding: '0.4rem 0', fontSize: '0.85rem', color: '#333' }}>
                    <span style={{ color: '#2d6a4f', fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Phases résumé */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ color: '#1a3a6b', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>
                📊 Avancement par phase
              </h3>
              {PHASES.map((phase, i) => {
                const st = statusConfig[phase.statut];
                return (
                  <div key={i} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#1a3a6b', fontSize: '0.85rem' }}>Phase {phase.numero} — {phase.titre}</span>
                        <span style={{ background: st.bg, color: st.color, padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.68rem', fontWeight: 700 }}>
                          {st.label}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: phase.progress === 100 ? '#2d6a4f' : '#c9973a' }}>
                        {phase.progress}%
                      </span>
                    </div>
                    <div style={{ background: '#ede9e0', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                      <div style={{
                        background: phase.progress === 100 ? '#2d6a4f' : phase.progress > 0 ? '#c9973a' : '#ede9e0',
                        height: '100%', width: `${phase.progress}%`, borderRadius: '4px', transition: 'width 0.8s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PHASES */}
        {activeTab === 'phases' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {PHASES.map((phase, i) => {
              const st = statusConfig[phase.statut];
              return (
                <div key={i} style={{
                  background: '#fff', borderRadius: '12px', padding: '1.5rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  borderLeft: `5px solid ${st.color}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ background: '#1a3a6b', color: '#fff', padding: '0.15rem 0.6rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700 }}>
                          Phase {phase.numero}
                        </span>
                        <span style={{ background: st.bg, color: st.color, padding: '0.15rem 0.6rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700 }}>
                          {st.label}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#8a8a8a' }}>📅 {phase.periode}</span>
                      </div>
                      <h3 style={{ color: '#1a3a6b', margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                        {phase.titre}
                      </h3>
                      <p style={{ color: '#666', fontSize: '0.85rem', margin: '0.4rem 0 0', lineHeight: 1.6 }}>
                        {phase.description}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: st.color }}>{phase.progress}%</div>
                      <div style={{ fontSize: '0.68rem', color: '#8a8a8a' }}>complété</div>
                    </div>
                  </div>
                  <div style={{ background: '#ede9e0', borderRadius: '4px', height: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <div style={{ background: st.color, height: '100%', width: `${phase.progress}%`, borderRadius: '4px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {phase.activites.map((act, j) => (
                      <div key={j} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.82rem', color: '#333' }}>
                        <span style={{ color: act.includes('✅') ? '#2d6a4f' : '#8a8a8a', flexShrink: 0 }}>
                          {act.includes('✅') ? '✅' : act.includes('en cours') ? '🔄' : '○'}
                        </span>
                        <span>{act.replace('✅', '').trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LOGEMENTS */}
        {activeTab === 'logements' && (
          <div>
            <div style={{ background: '#1a3a6b', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', color: '#fff' }}>
              <div style={{ fontSize: '0.72rem', color: '#c9973a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                Récapitulatif
              </div>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div><div style={{ fontSize: '2rem', fontWeight: 800, color: '#c9973a' }}>320</div><div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Logements total</div></div>
                <div><div style={{ fontSize: '2rem', fontWeight: 800, color: '#7effa0' }}>5</div><div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Types de villas</div></div>
                <div><div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>85-200m²</div><div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Superficie</div></div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {LOGEMENTS.map((log, i) => (
                <div key={i} style={{
                  background: '#fff', borderRadius: '12px', padding: '1.5rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  borderTop: '4px solid #c9973a'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{log.icon}</div>
                  <h3 style={{ color: '#1a3a6b', margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700 }}>{log.type}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.82rem', color: '#8a8a8a' }}>Superficie</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#333' }}>{log.surface}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.82rem', color: '#8a8a8a' }}>Unités</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1a3a6b' }}>{log.nb} logements</span>
                    </div>
                  </div>
                  <div style={{ background: '#f8f5ef', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#c9973a' }}>{log.prix}</div>
                    <div style={{ fontSize: '0.72rem', color: '#8a8a8a', marginTop: '0.2rem' }}>Prix indicatif</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PARTENAIRES */}
        {activeTab === 'partenaires' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {PARTENAIRES.map((p, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: '12px', padding: '1.5rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                borderLeft: '4px solid #1a3a6b'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{p.icon}</div>
                <h3 style={{ color: '#1a3a6b', margin: '0 0 0.3rem', fontSize: '1.05rem', fontWeight: 700 }}>{p.nom}</h3>
                <div style={{ fontSize: '0.82rem', color: '#c9973a', fontWeight: 600, marginBottom: '0.5rem' }}>{p.role}</div>
                <div style={{ fontSize: '0.82rem', color: '#666', marginBottom: '0.75rem' }}>{p.contact}</div>
                <span style={{ background: '#eaf4ee', color: '#2d6a4f', padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700 }}>
                  ✅ {p.statut}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* FINANCES */}
        {activeTab === 'finances' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#1a3a6b', borderRadius: '12px', padding: '1.75rem', color: '#fff' }}>
              <div style={{ fontSize: '0.72rem', color: '#c9973a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                🏦 Compte BHS — Banque de l'Habitat du Sénégal
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem' }}>
                {[
                  { label: 'Solde au 01/01/2026', value: '6 909 110', color: '#fff' },
                  { label: 'Cotisations reçues',  value: '+ 920 200', color: '#7effa0' },
                  { label: 'Dépenses arch.',      value: '- 4 011 900', color: '#ff9a9a' },
                  { label: 'Solde au 13/07/2026', value: '3 817 410', color: '#c9973a' },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.3rem' }}>{item.label}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: item.color }}>{item.value} FCFA</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ color: '#1a3a6b', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>
                📊 Dépenses engagées
              </h3>
              {[
                { date: '25/02/2026', desc: 'Studio Architecture SAR — Acompte 1', montant: '2 500 000 FCFA', ref: 'Z0158943089' },
                { date: '05/03/2026', desc: 'Studio Architecture SAR — Acompte 2', montant: '1 500 000 FCFA', ref: 'Z0159938475' },
                { date: 'Divers',     desc: 'Frais bancaires BHS',                montant: '11 900 FCFA',   ref: 'Divers' },
              ].map((dep, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem', background: i % 2 === 0 ? '#f8f5ef' : '#fff',
                  borderRadius: '6px', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#333', fontSize: '0.85rem' }}>{dep.desc}</div>
                    <div style={{ fontSize: '0.72rem', color: '#8a8a8a' }}>📅 {dep.date} · Réf: {dep.ref}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#c0392b', fontSize: '0.9rem' }}>{dep.montant}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
