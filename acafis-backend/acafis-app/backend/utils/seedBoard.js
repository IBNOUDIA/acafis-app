require('dotenv').config();
const mongoose = require('mongoose');
const BoardMember = require('../models/BoardMember');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connecté');
};

// Composition actuelle du bureau (2024–2026), à mettre à jour après l'AG
// directement depuis la page Bureau de l'app plutôt qu'en relançant ce script.
const MEMBRES = [
  { firstName: 'Omar',       lastName: 'Sarr',    role: 'president',           order: 1 },
  { firstName: 'Khadime',    lastName: 'Gueye',   role: 'vice_president',      order: 2 },
  { firstName: 'Ibra',       lastName: 'Mbaye',   role: 'secretaire_general',  order: 3 },
  { firstName: 'Mbaye',      lastName: 'Diouf',   role: 'secretaire_adjoint',  order: 4 },
  { firstName: 'Bintou',     lastName: 'Sarr',    role: 'tresoriere',          order: 5 },
  { firstName: 'Boubacar',   lastName: 'Diallo',  role: 'tresorier_adjoint',   order: 6 },
  { firstName: 'Landiata',   lastName: 'Dieme',   role: 'administrateur',     order: 7 },
  { firstName: 'Souleymane', lastName: 'Diallo',  role: 'administrateur',     order: 8 },
  { firstName: 'Omar',       lastName: 'Cissé',   role: 'administrateur',     order: 9 },
];

const seedBoard = async () => {
  await connectDB();

  const existing = await BoardMember.countDocuments();
  if (existing > 0) {
    console.log(`⚠️  ${existing} membre(s) du bureau déjà en base — seed annulé pour éviter les doublons.`);
    process.exit(0);
  }

  const created = await BoardMember.create(MEMBRES);
  console.log(`✅ ${created.length} membre(s) du bureau créé(s) :`);
  created.forEach(m => console.log(`   - ${m.firstName} ${m.lastName} (${m.role})`));
  console.log('\n🎉 Bureau initialisé — assigne les commissions et les liens LinkedIn depuis la page Bureau.');

  process.exit(0);
};

seedBoard().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});