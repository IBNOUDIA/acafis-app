require('dotenv').config();
const mongoose = require('mongoose');
const Member   = require('../models/Member');
const Meeting  = require('../models/Meeting');
const User     = require('../models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connecté');
};

const MEMBRES = [
  // ✅ Présents physiquement (18)
  { no: 1,  prenom: 'Aminata',               nom: 'Seck',       presence: 'oui', procuration: null },
  { no: 2,  prenom: 'Bator',                 nom: 'Beye',       presence: 'oui', procuration: null },
  { no: 3,  prenom: 'Binetou Diangoute Marie',nom: 'Sarr',      presence: 'oui', procuration: null },
  { no: 4,  prenom: 'Ciré',                  nom: 'Aw',         presence: 'oui', procuration: null },
  { no: 5,  prenom: 'Jacqueline',            nom: 'Thiaré',     presence: 'oui', procuration: null },
  { no: 6,  prenom: 'Landiata',              nom: 'Diémé',      presence: 'oui', procuration: null },
  { no: 7,  prenom: 'Massamba',              nom: 'Diop',       presence: 'oui', procuration: null },
  { no: 8,  prenom: 'Mbaye',                 nom: 'Diouf',      presence: 'oui', procuration: null },
  { no: 9,  prenom: 'Mohamed Ndongo',        nom: 'Sangaré',    presence: 'oui', procuration: null },
  { no: 10, prenom: 'Mounirou Diémé',        nom: 'Diémé',      presence: 'oui', procuration: null },
  { no: 11, prenom: 'Moussa Mbaye',          nom: 'Gueye',      presence: 'oui', procuration: null },
  { no: 12, prenom: 'Ndeye Bana',            nom: 'Diédhiou',   presence: 'oui', procuration: null },
  { no: 13, prenom: 'Ndeye Tacko',           nom: 'Dieye',      presence: 'oui', procuration: null },
  { no: 14, prenom: 'Omar',                  nom: 'Sarr',       presence: 'oui', procuration: null },
  { no: 15, prenom: 'Oumar',                 nom: 'Cissé',      presence: 'oui', procuration: null },
  { no: 16, prenom: 'Rose',                  nom: 'Ngom',       presence: 'oui', procuration: null },
  { no: 17, prenom: 'Salimata',              nom: 'Diallo',     presence: 'oui', procuration: null },
  { no: 18, prenom: 'Souleymane',            nom: 'Diallo',     presence: 'oui', procuration: null },
  // ❌ Absents avec procuration (10)
  { no: 19, prenom: 'Ahmédou Moctar',        nom: 'Dia',        presence: 'non', procuration: 'Ciré Aw' },
  { no: 20, prenom: 'Fatoumata Abou',        nom: 'Dia',        presence: 'non', procuration: 'Ciré Aw' },
  { no: 21, prenom: 'Robert',                nom: 'Thiaré',     presence: 'non', procuration: 'Jacqueline Thiaré' },
  { no: 22, prenom: 'Assane',                nom: 'Kébé',       presence: 'non', procuration: 'Omar Sarr' },
  { no: 23, prenom: 'Moustapha',             nom: 'Mbaye',      presence: 'non', procuration: 'Omar Sarr' },
  { no: 24, prenom: 'Sérigne Ibra',          nom: 'Mbaye',      presence: 'non', procuration: 'Omar Sarr' },
  { no: 25, prenom: 'Mame Ndella',           nom: 'Faye',       presence: 'non', procuration: 'Oumar Cissé' },
  { no: 26, prenom: 'Moctar',                nom: 'Fall',       presence: 'non', procuration: 'Oumar Cissé' },
  { no: 27, prenom: 'Moustapha',             nom: 'Sané',       presence: 'non', procuration: 'Oumar Cissé' },
  { no: 28, prenom: 'Samba',                 nom: 'Ka',         presence: 'non', procuration: 'Rose Ngom' },
  // ⚠️ Absents sans procuration (11)
  { no: 29, prenom: 'Abdoulaye',             nom: 'Diatta',     presence: 'non', procuration: null },
  { no: 30, prenom: 'Aissatou',              nom: 'Diagne',     presence: 'non', procuration: null },
  { no: 31, prenom: 'Alioune Meissa',        nom: 'Fall',       presence: 'non', procuration: null },
  { no: 32, prenom: 'Aoua Bocar',            nom: 'Ly',         presence: 'non', procuration: null },
  { no: 33, prenom: 'Doudou',               nom: 'Camara',     presence: 'non', procuration: null },
  { no: 34, prenom: 'Fatima',               nom: 'Mbow',       presence: 'non', procuration: null },
  { no: 35, prenom: 'Khadim',               nom: 'Gueye',      presence: 'non', procuration: null },
  { no: 36, prenom: 'Khoudia',              nom: 'Mboup',      presence: 'non', procuration: null },
  { no: 37, prenom: 'Maty',                 nom: 'Gueye',      presence: 'non', procuration: null },
  { no: 38, prenom: 'Pascaline Mame',       nom: 'Thiaré',     presence: 'non', procuration: null },
  { no: 39, prenom: 'Seydou',               nom: 'Sow',        presence: 'non', procuration: null },
  // ⬜ Statut inconnu (7)
  { no: 40, prenom: 'Ababacar',             nom: 'Ba',         presence: null,  procuration: null },
  { no: 41, prenom: 'Aimée Dib',            nom: 'Thiaré',     presence: null,  procuration: null },
  { no: 42, prenom: 'Boubacar',             nom: 'Diallo',     presence: null,  procuration: null },
  { no: 43, prenom: 'Diama',               nom: 'Ndiaye',     presence: null,  procuration: null },
  { no: 44, prenom: 'Mariama',             nom: 'Diédhiou',   presence: null,  procuration: null },
  { no: 45, prenom: 'Ngoné',               nom: 'Diouf',      presence: null,  procuration: null },
  { no: 46, prenom: 'Oumar',               nom: 'Sy',         presence: null,  procuration: null },
];

const seedMembers = async () => {
  await connectDB();

  const admin = await User.findOne({ role: 'super_admin' });
  await Member.deleteMany({});
  console.log('🗑️  Anciens membres supprimés');

  const members = await Member.create(
    MEMBRES.map(m => ({
      memberNumber: `ACQ-${String(m.no).padStart(3, '0')}`,
      firstName:    m.prenom,
      lastName:     m.nom,
      email:        `membre${m.no}@acafis.ca`,
      status:       'actif',
      financial: {
        totalAmount: 500000,
        paidAmount:  0,
        balance:     500000,
        status:      'retard_majeur',
      },
      notes: m.procuration
        ? `Procuration : ${m.procuration}`
        : m.presence === null ? 'Statut non confirmé' : '',
      joinDate: new Date('2021-11-15'),
    }))
  );

  console.log(`✅ ${members.length} membres importés`);

  // Mettre à jour l'AG avec le lieu
  const ag = await Meeting.findOne({ type: 'ag_ordinaire' });
  if (ag) {
    ag.location = '9100 Boul. Saint-Laurent # 600A, Montréal, QC H2N 1M9';
    ag.platform = 'Hybride — Présentiel + Jitsi Meet';
    await ag.save();
    console.log('✅ AG mise à jour');
  }

  const presents    = MEMBRES.filter(m => m.presence === 'oui').length;
  const absents     = MEMBRES.filter(m => m.presence === 'non').length;
  const procurations= MEMBRES.filter(m => m.procuration).length;
  const inconnus    = MEMBRES.filter(m => m.presence === null).length;

  console.log('\n📊 Statistiques AG :');
  console.log(`   ✅ Présents physiquement : ${presents}`);
  console.log(`   ❌ Absents              : ${absents}`);
  console.log(`   📋 Avec procuration     : ${procurations}`);
  console.log(`   ⬜ Statut inconnu       : ${inconnus}`);
  console.log(`   👥 Total membres        : ${members.length}`);
  console.log('\n🎉 Import terminé avec succès !');

  process.exit(0);
};

seedMembers().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});