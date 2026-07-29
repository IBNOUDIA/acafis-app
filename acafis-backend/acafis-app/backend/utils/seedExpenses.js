require('dotenv').config();
const mongoose = require('mongoose');
const Expense  = require('../models/Expense');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connecté');
};

// Dépenses déjà connues (actuellement codées en dur dans Finance.jsx),
// migrées ici comme point de départ réel pour le suivi par commission.
const DEPENSES = [
  {
    commission: 'habitat',
    description: 'Acompte 1 — Architecture',
    category: 'Studio Architecture Amadou M. SAR',
    amount: 2500000,
    date: new Date('2026-02-25'),
  },
  {
    commission: 'habitat',
    description: 'Acompte 2 — Architecture',
    category: 'Studio Architecture Amadou M. SAR',
    amount: 1500000,
    date: new Date('2026-03-05'),
  },
  {
    commission: 'finance',
    description: 'Frais bancaires',
    category: 'Divers',
    amount: 11900,
    date: new Date('2026-07-13'), // date exacte inconnue — à ajuster si besoin
  },
];

const seedExpenses = async () => {
  await connectDB();

  const existing = await Expense.countDocuments();
  if (existing > 0) {
    console.log(`⚠️  ${existing} dépense(s) déjà présente(s) en base — migration annulée pour éviter les doublons.`);
    console.log('   Supprime la collection manuellement si tu veux relancer la migration depuis zéro.');
    process.exit(0);
  }

  const created = await Expense.create(DEPENSES);
  console.log(`✅ ${created.length} dépense(s) migrée(s) :`);
  created.forEach(e => {
    console.log(`   - [${e.commission}] ${e.description} : ${e.amount.toLocaleString('fr-FR')} FCFA (${e.date.toLocaleDateString('fr-FR')})`);
  });

  const total = created.reduce((sum, e) => sum + e.amount, 0);
  console.log(`\n💰 Total migré : ${total.toLocaleString('fr-FR')} FCFA`);
  console.log('🎉 Migration terminée avec succès !');

  process.exit(0);
};

seedExpenses().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});