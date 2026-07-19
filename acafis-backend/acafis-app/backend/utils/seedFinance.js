require('dotenv').config();
const mongoose = require('mongoose');
const Payment  = require('../models/Payment');
const Member   = require('../models/Member');
const User     = require('../models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connecté');
};

const seedFinance = async () => {
  await connectDB();

  // Récupérer admin pour createdBy
  const admin = await User.findOne({ role: 'super_admin' });

  // Supprimer anciens paiements
  await Payment.deleteMany({});

  // Créer membres temporaires pour les transactions
  await Member.deleteMany({});

  const members = await Member.create([
    {
      memberNumber: 'ACQ-001',
      firstName: 'Mounirou', lastName: 'Dieme',
      email: 'mounirou.dieme@acafis.ca',
      financial: { totalAmount: 500000, paidAmount: 120000, balance: 380000, status: 'retard_majeur' }
    },
    {
      memberNumber: 'ACQ-002',
      firstName: 'Samba', lastName: 'Ka',
      email: 'samba.ka@acafis.ca',
      financial: { totalAmount: 500000, paidAmount: 400000, balance: 100000, status: 'retard_mineur' }
    },
    {
      memberNumber: 'ACQ-003',
      firstName: 'Moussa Mbaye', lastName: 'Gueye',
      email: 'moussa.gueye@acafis.ca',
      financial: { totalAmount: 500000, paidAmount: 100000, balance: 400000, status: 'retard_majeur' }
    },
    {
      memberNumber: 'ACQ-004',
      firstName: 'Idrissa', lastName: 'Dollé',
      email: 'idrissa.dolle@acafis.ca',
      phone: '+221 775714468',
      financial: { totalAmount: 500000, paidAmount: 300200, balance: 199800, status: 'retard_mineur' }
    },
  ]);

  console.log(`✅ ${members.length} membres créés`);

  // Transactions réelles du relevé BHS
  const payments = await Payment.create([
    {
      member: members[0]._id,
      amount: 120000,
      currency: 'XOF',
      type: 'cotisation',
      method: 'virement_bancaire',
      status: 'confirmé',
      reference: 'Z0156805788',
      paymentDate: new Date('2026-01-20'),
      confirmedAt: new Date('2026-01-21'),
      confirmedBy: admin._id,
      period: { month: 1, year: 2026 },
      notes: 'VIREMENT RECU — DIEME MOUNIROU — TRANSFERT INTER BANCAIRE BHS',
      createdBy: admin._id,
    },
    {
      member: members[1]._id,
      amount: 400000,
      currency: 'XOF',
      type: 'cotisation',
      method: 'virement_bancaire',
      status: 'confirmé',
      reference: 'Z0158488263',
      paymentDate: new Date('2026-02-12'),
      confirmedAt: new Date('2026-02-13'),
      confirmedBy: admin._id,
      period: { month: 2, year: 2026 },
      notes: 'COTISATION 2024-2025 — KA SAMBA',
      createdBy: admin._id,
    },
    {
      member: members[2]._id,
      amount: 100000,
      currency: 'XOF',
      type: 'cotisation',
      method: 'virement_bancaire',
      status: 'confirmé',
      reference: 'Z0162102261',
      paymentDate: new Date('2026-04-09'),
      confirmedAt: new Date('2026-04-10'),
      confirmedBy: admin._id,
      period: { month: 4, year: 2026 },
      notes: 'Cotisation annuelle — GUEYE MOUSSA MBAYE',
      createdBy: admin._id,
    },
    {
      member: members[3]._id,
      amount: 300200,
      currency: 'XOF',
      type: 'acompte',
      method: 'especes',
      status: 'confirmé',
      reference: 'Z0166542580',
      paymentDate: new Date('2026-06-17'),
      confirmedAt: new Date('2026-06-18'),
      confirmedBy: admin._id,
      period: { month: 6, year: 2026 },
      notes: 'VERSEMENT ESPÈCES — IDRISSA DOLLÉ / 775714468',
      createdBy: admin._id,
    },
  ]);

  console.log(`✅ ${payments.length} transactions importées depuis relevé BHS`);
  console.log('\n📊 Résumé financier BHS :');
  console.log('   Solde au 01/01/2026 : 6 909 110 FCFA');
  console.log('   Total crédits       :   920 200 FCFA');
  console.log('   Total débits        : 4 011 900 FCFA');
  console.log('   Solde au 13/07/2026 : 3 817 410 FCFA');

  process.exit(0);
};

seedFinance().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});