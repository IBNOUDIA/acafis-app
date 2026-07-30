require('dotenv').config();
const mongoose = require('mongoose');
const Member   = require('../models/Member');
const fees     = require('../config/fees');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connecté');
};

// ══ LISTE OFFICIELLE DES 44 ACQUÉREURS DE LA COOPÉRATIVE (Liste2026.pdf) ══
// Email/téléphone réels fournis par l'association ; présence/procuration
// reprises de l'ancien fichier de présence AG quand disponibles.
// NB : Ababacar BA et Alima Ngom ont été retirés (ne font pas partie de la coopérative).
const MEMBRES = [
  { no: 1, prenom: 'Abdoulaye', nom: 'Diatta', email: 'abdou.diatta9@gmail.com', phone: '+1 438-502-7300', presence: 'non', procuration: null },
  { no: 2, prenom: 'Ahmédou Moctar', nom: 'Dia', email: 'moctar71dia@yahoo.fr', phone: '+1 438-990-9071', presence: 'non', procuration: 'Ciré Aw' },
  { no: 3, prenom: 'Aimée Dib', nom: 'Thiaré', email: 'aimedibthiare@yahoo.fr', phone: '+1 819-830-2012', presence: null, procuration: null },
  { no: 4, prenom: 'Aissatou', nom: 'Diagne', email: 'elgadiagne@gmail.com', phone: '+1 438-877-3629', presence: 'non', procuration: null },
  { no: 5, prenom: 'Alioune Maissa', nom: 'Fall', email: 'fallougalas444@gmail.com', phone: '+1 514-560-5090', presence: 'non', procuration: null },
  { no: 6, prenom: 'Aminata', nom: 'Seck', email: 'aminataseck.sarr@gmail.com', phone: '+1 819-461-1939', presence: 'oui', procuration: null },
  { no: 7, prenom: 'Aoua Bocar', nom: 'Ly', email: 'aouab_ly.tall@ymail.com', phone: '+221-78-605-4661', presence: 'non', procuration: null },
  { no: 8, prenom: 'Assane', nom: 'Kébé', email: null, phone: '+1 438-989-5559', presence: 'non', procuration: 'Omar Sarr' },
  { no: 9, prenom: 'Bator', nom: 'Beye', email: 'bator18beye@hotmail.fr', phone: '+1 514-449-4352', presence: 'oui', procuration: null },
  { no: 10, prenom: 'Binetou D. M.', nom: 'Sarr', email: 'bineta.sarr@gmail.com', phone: '+1 514-919-7838', presence: 'oui', procuration: null },
  { no: 11, prenom: 'Boubacar', nom: 'Diallo', email: 'boubacar233diallo@gmail.com', phone: '+1 514-970-8148', presence: null, procuration: null },
  { no: 12, prenom: 'Ciré', nom: 'Aw', email: 'cireaw@yahoo.fr', phone: '+1 514-795-3349', presence: 'oui', procuration: null },
  { no: 13, prenom: 'Diama', nom: 'Ndiaye', email: 'ndiama404@gmail.com', phone: '+1 438-938-3493', presence: null, procuration: null },
  { no: 14, prenom: 'Doudou', nom: 'Camara', email: 'doucama@gmail.com', phone: '+1 (438) 373-3803', presence: 'non', procuration: null },
  { no: 15, prenom: 'Fatimata', nom: 'Mbow', email: 'fatimambow91@gmail.com', phone: '+1 438-395-4158', presence: 'non', procuration: null },
  { no: 16, prenom: 'Fatoumata Abou', nom: 'Dia', email: 'fatoumataaboudia@yahoo.fr', phone: '+1 514-797-0987', presence: 'non', procuration: 'Ciré Aw' },
  { no: 17, prenom: 'Jacqueline', nom: 'Thiaré', email: 'thiarejaquy@yahoo.fr', phone: '+1 438-401-6081', presence: 'oui', procuration: null },
  { no: 18, prenom: 'Khadim', nom: 'Gueye', email: 'khadim.gueye@engilaro.com', phone: '+221-77-321-3312', presence: 'non', procuration: null },
  { no: 19, prenom: 'Khoudia', nom: 'Mboup', email: 'xujamboup@gmail.com', phone: '+221-77-464-4980', presence: 'non', procuration: null },
  { no: 20, prenom: 'Landiata', nom: 'Diémé', email: 'afroleck@afroleck.com', phone: '+1 514-813-2376', presence: 'oui', procuration: null },
  { no: 21, prenom: 'Mame Ndella', nom: 'Faye', email: 'ndecimomo@gmail.com', phone: '+221-77-655-8564', presence: 'non', procuration: 'Oumar Cissé' },
  { no: 22, prenom: 'Mariama', nom: 'Diédhiou', email: 'ngomadiedhiou@gmail.com', phone: '+1 514-834-3970', presence: null, procuration: null },
  { no: 23, prenom: 'Massamba', nom: 'Diop', email: 'famass522@gmail.com', phone: '+1 819-469-1933', presence: 'oui', procuration: null },
  { no: 24, prenom: 'Maty', nom: 'Gueye', email: null, phone: '+1 (404) 940-0009', presence: 'non', procuration: null },
  { no: 25, prenom: 'Mbaye', nom: 'Diouf', email: 'mbayedd1@yahoo.fr', phone: '+1 438-878-3493', presence: 'oui', procuration: null },
  { no: 26, prenom: 'Moctar', nom: 'Fall', email: 'moctarfall@gmail.com', phone: '+1 819-598-9357', presence: 'non', procuration: 'Oumar Cissé' },
  { no: 27, prenom: 'Mohamed Ndongo', nom: 'SANGARÉ', email: 'ndongosangare@gmail.com', phone: '+1 514-503-7647', presence: 'oui', procuration: null },
  { no: 28, prenom: 'Mounirou', nom: 'Diémé', email: 'katipeu@gmail.com', phone: '+1 514-568-5344', presence: 'oui', procuration: null },
  { no: 29, prenom: 'Moussa Mbaye', nom: 'Gueye', email: 'moussamgueye@hotmail.com', phone: '+221 77 575 0537', presence: 'oui', procuration: null },
  { no: 30, prenom: 'Moustapha', nom: 'Sané', email: 'taphasane@hotmail.com', phone: '+1 514-250-7209', presence: 'non', procuration: 'Oumar Cissé' },
  { no: 31, prenom: 'Ndeye Bana', nom: 'Diédhiou', email: 'ndeyeb.diedhiou@gmail.com', phone: '+1 438-345-9670', presence: 'oui', procuration: null },
  { no: 32, prenom: 'Ndeye Tacko', nom: 'Dieye', email: 'ntdieye@live.ca', phone: '+1 514-770-7757', presence: 'oui', procuration: null },
  { no: 33, prenom: 'Ngoné', nom: 'Diouf', email: 'ngonedioufsl@hotmail.com', phone: '+1 514-805-7779', presence: null, procuration: null },
  { no: 34, prenom: 'Omar', nom: 'Sarr', email: 'omar.sarr@gmail.com', phone: '+1 418-265-0499', presence: 'oui', procuration: null },
  { no: 35, prenom: 'Oumar', nom: 'Cissé', email: 'oumso@hotmail.com', phone: '+1 514-746-9059', presence: 'oui', procuration: null },
  { no: 36, prenom: 'Oumar', nom: 'Sy', email: 'oumarib_sy@yahoo.fr', phone: '+1 819-776-4261', presence: null, procuration: null },
  { no: 37, prenom: 'Pascaline Mame', nom: 'Thiaré', email: 'pascalinethiare@yahoo.fr', phone: '+1 819-830-0088', presence: 'non', procuration: null },
  { no: 38, prenom: 'Robert', nom: 'Thiaré', email: 'thiarerobert07@protonmail.com', phone: '+1 438-401-6081', presence: 'non', procuration: 'Jacqueline Thiaré' },
  { no: 39, prenom: 'Rose', nom: 'Ngom', email: 'rosengom@hotmail.com', phone: '+1 819-807-4600', presence: 'oui', procuration: null },
  { no: 40, prenom: 'Salimata', nom: 'Diallo', email: 'slijallo5@gmail.com', phone: '+1 438-978-1840', presence: 'oui', procuration: null },
  { no: 41, prenom: 'Samba', nom: 'Ka', email: 'sambasahelien@gmail.com', phone: '+1 819-461-2541', presence: 'non', procuration: 'Rose Ngom' },
  { no: 42, prenom: 'Sérigne Ibra', nom: 'Mbaye', email: 'serigne.ibra@yahoo.ca', phone: '+1 (819) 388-7762', presence: 'non', procuration: 'Omar Sarr' },
  { no: 43, prenom: 'Seydou', nom: 'Sow', email: 'seydousow@hotmail.com', phone: '+221-77-868-1243', presence: 'non', procuration: null },
  { no: 44, prenom: 'Souleymane', nom: 'Diallo', email: 'souley39@gmail.com', phone: '+1 514-653-1787', presence: 'oui', procuration: null },
];

const seedMembers = async () => {
  await connectDB();

  // Supprimer anciens membres
  await Member.deleteMany({});
  console.log('🗑️  Anciens membres supprimés');

  const JOIN_DATE = new Date('2021-11-15');
  const montantDu = fees.calculerMontantDu(JOIN_DATE);

  const members = await Member.create(
    MEMBRES.map(m => ({
      memberNumber: `ACQ-${String(m.no).padStart(3, '0')}`,
      firstName:    m.prenom,
      lastName:     m.nom,
      email:        m.email || `${m.prenom.toLowerCase().replace(/\s+/g, '.')}.${m.nom.toLowerCase().replace(/\s+/g, '.')}@a-confirmer.acafis.ca`,
      phone:        m.phone,
      status:       'actif',
      financial: {
        totalAmount:  montantDu, // part social (250 000 FCFA) + cotisations annuelles (100 000 FCFA/an) depuis l'adhésion
        paidAmount:   0,
        balance:      montantDu,
        partSocialPaye: false,
        status:       'retard_majeur',
      },
      notes: [
        !m.email ? 'Email à confirmer avec le membre' : null,
        m.procuration ? `Procuration donnée à : ${m.procuration}` : null,
        m.presence === null ? 'Statut de présence AG non confirmé' : null,
      ].filter(Boolean).join(' | '),
      joinDate: JOIN_DATE,
    }))
  );

  console.log(`✅ ${members.length} membres importés`);

  // Statistiques
  const presents         = MEMBRES.filter(m => m.presence === 'oui').length;
  const absents           = MEMBRES.filter(m => m.presence === 'non').length;
  const procurations      = MEMBRES.filter(m => m.procuration).length;
  const inconnus          = MEMBRES.filter(m => m.presence === null).length;
  const emailsAConfirmer  = MEMBRES.filter(m => !m.email).length;

  console.log('\n📊 Statistiques AG :');
  console.log(`   ✅ Présents physiquement : ${presents}`);
  console.log(`   ❌ Absents              : ${absents}`);
  console.log(`   📋 Avec procuration     : ${procurations}`);
  console.log(`   ⬜ Statut inconnu       : ${inconnus}`);
  console.log(`   📧 Emails à confirmer   : ${emailsAConfirmer}`);
  console.log(`   👥 Total membres        : ${members.length}`);
  console.log(`   💰 Montant dû/membre    : ${montantDu.toLocaleString('fr-FR')} FCFA (part social + cotisations)`);
  console.log('\n🎉 Import terminé avec succès !');

  process.exit(0);
};

seedMembers().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});