require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Meeting = require('../models/Meeting');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connecté pour seed');
};

const seedUsers = async () => {
  await User.deleteMany({});

  const users = [
    { firstName: 'Omar',        lastName: 'Sarr',     email: 'omar.sarr@acafis.ca',       password: 'Acafis2026!', role: 'super_admin',  position: 'Président' },
    { firstName: 'Khadime',     lastName: 'Gueye',    email: 'khadime.gueye@acafis.ca',    password: 'Acafis2026!', role: 'admin',         position: 'Vice-Président' },
    { firstName: 'Ibra',        lastName: 'Mbaye',    email: 'ibra.mbaye@acafis.ca',       password: 'Acafis2026!', role: 'admin',         position: 'Secrétaire Général' },
    { firstName: 'Mbaye',       lastName: 'Diouf',    email: 'mbaye.diouf@acafis.ca',      password: 'Acafis2026!', role: 'admin',         position: 'Secrétaire Adjoint' },
    { firstName: 'Bintou',      lastName: 'Sarr',     email: 'bintou.sarr@acafis.ca',      password: 'Acafis2026!', role: 'admin_finance', position: 'Trésorière' },
    { firstName: 'Boubacar',    lastName: 'Diallo',   email: 'boubacar.diallo@acafis.ca',  password: 'Acafis2026!', role: 'admin_finance', position: 'Trésorier Adjoint' },
    { firstName: 'Landiata',    lastName: 'Dieme',    email: 'landiata.dieme@acafis.ca',   password: 'Acafis2026!', role: 'membre_ca',     position: 'Administrateur' },
    { firstName: 'Souleymane',  lastName: 'Diallo',   email: 'souleymane.diallo@acafis.ca',password: 'Acafis2026!', role: 'membre_ca',     position: 'Administrateur' },
    { firstName: 'Omar',        lastName: 'Cissé',    email: 'omar.cisse@acafis.ca',       password: 'Acafis2026!', role: 'membre_ca',     position: 'Administrateur' },
    // Compte test Amar
    { firstName: 'Amar',        lastName: 'Dia',      email: 'diaamar757@gmail.com',       password: 'Acafis2026!', role: 'super_admin',   position: 'Développeur' },
  ];

  const created = await User.create(users);
  console.log(`✅ ${created.length} utilisateurs créés`);
  return created;
};

const seedAG = async (users) => {
  await Meeting.deleteMany({});

  const president = users.find(u => u.position === 'Président');

  const ag = await Meeting.create({
    title: 'Assemblée Générale ACAFIS — Juillet 2026',
    type: 'ag_ordinaire',
    date: new Date('2026-08-01T14:00:00'),
    time: '14:00',
    duration: 180,
    platform: 'Jitsi Meet',
    meetingUrl: 'https://meet.jit.si/ACAFIS-AG-2026',
    status: 'planifiée',
    agenda: [
      { order: 1, title: 'Ouverture et quorum', duration: 10 },
      { order: 2, title: 'Approbation du procès-verbal de la dernière AG', duration: 15 },
      { order: 3, title: 'Rapport du Président — État du projet Cité Jardin Ndianda', duration: 30 },
      { order: 4, title: 'Rapport financier — Trésorière Bintou Sarr', duration: 30 },
      { order: 5, title: 'État des cotisations — Suivi des 48 acquéreurs', duration: 20 },
      { order: 6, title: 'Avancement des démarches au Sénégal', duration: 25 },
      { order: 7, title: 'Questions diverses et période de questions', duration: 30 },
      { order: 8, title: 'Clôture de l\'assemblée', duration: 10 },
    ],
    convocationSent: false,
    createdBy: president._id,
  });

  console.log(`✅ AG du 1er août 2026 créée : ${ag.title}`);
};

const seed = async () => {
  try {
    await connectDB();
    const users = await seedUsers();
    await seedAG(users);
    console.log('\n🎉 Base de données initialisée avec succès !');
    console.log('\n📋 Comptes créés :');
    console.log('   • omar.sarr@acafis.ca (Président / Super Admin)');
    console.log('   • bintou.sarr@acafis.ca (Trésorière / Admin Finance)');
    console.log('   • diaamar757@gmail.com (Développeur / Super Admin)');
    console.log('   • Mot de passe pour tous : Acafis2026!');
    console.log('\n📅 Réunion créée :');
    console.log('   • AG ACAFIS — 1er août 2026 à 14h00 (Jitsi Meet)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur seed:', error);
    process.exit(1);
  }
};

seed();
