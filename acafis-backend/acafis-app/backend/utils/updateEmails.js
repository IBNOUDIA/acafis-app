require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');
const Member   = require('../models/Member');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connecté');
};

// ── MEMBRES CA avec vrais emails ──
const CA_EMAILS = [
  { firstName: 'Omar',       lastName: 'Sarr',    email: 'president@coop-acafis.com',      role: 'super_admin',  position: 'Président' },
  { firstName: 'Khadime',    lastName: 'Gueye',   email: 'katipeu@gmail.com',              role: 'admin',        position: 'Vice-Président' },
  { firstName: 'Ibra',       lastName: 'Mbaye',   email: 'taphasane1910@gmail.com',        role: 'admin',        position: 'Secrétaire Général' },
  { firstName: 'Mbaye',      lastName: 'Diouf',   email: 'mbayediouf.uba@gmail.com',       role: 'admin',        position: 'Secrétaire Adjoint' },
  { firstName: 'Bintou',     lastName: 'Sarr',    email: 'binetoud.sarr@gmail.com',        role: 'admin_finance',position: 'Trésorière' },
  { firstName: 'Boubacar',   lastName: 'Diallo',  email: 'boubacar233diallo@gmail.com',    role: 'admin_finance',position: 'Trésorier Adjoint' },
  { firstName: 'Landiata',   lastName: 'Dieme',   email: 'landieme@gmail.com',             role: 'membre_ca',    position: 'Administrateur' },
  { firstName: 'Souleymane', lastName: 'Diallo',  email: 'souley39@gmail.com',             role: 'membre_ca',    position: 'Administrateur' },
  { firstName: 'Omar',       lastName: 'Cissé',   email: 'oumar.tandian.cisse@gmail.com',  role: 'membre_ca',    position: 'Administrateur — Superviseur Technique' },
  { firstName: 'Amar',       lastName: 'Dia',     email: 'diaamar757@gmail.com',           role: 'super_admin',  position: 'Développeur' },
];

// ── ACQUÉREURS avec emails ──
const ACQUEREUR_EMAILS = [
  { memberNumber: 'ACQ-001', email: 'aminataseck.sarr@gmail.com' },   // Aminata Seck
  { memberNumber: 'ACQ-008', email: 'mbayediouf.uba@gmail.com' },     // Mbaye Diouf
  { memberNumber: 'ACQ-009', email: 'ndongosangare@gmail.com' },      // Mohamed Ndongo Sangaré
  { memberNumber: 'ACQ-011', email: 'ndecimomo@gmail.com' },          // Moussa Mbaye Gueye
  { memberNumber: 'ACQ-016', email: 'xujamboup@gmail.com' },          // Rose Ngom
  { memberNumber: 'ACQ-017', email: 'slijallo5@gmail.com' },          // Salimata Diallo
  { memberNumber: 'ACQ-018', email: 'souley39@gmail.com' },           // Souleymane Diallo
  { memberNumber: 'ACQ-026', email: 'moctarfall@gmail.com' },         // Moctar Fall
  { memberNumber: 'ACQ-028', email: 'sambasahelien@gmail.com' },      // Samba Ka
  { memberNumber: 'ACQ-029', email: 'abdou.diatta9@gmail.com' },      // Abdoulaye Diatta
  { memberNumber: 'ACQ-030', email: 'elgadiagne@gmail.com' },         // Aissatou Diagne
  { memberNumber: 'ACQ-045', email: 'ngonedioufsl77@gmail.com' },     // Ngoné Diouf
];

const updateEmails = async () => {
  await connectDB();

  // ── Mettre à jour les membres CA ──
  console.log('\n📧 Mise à jour emails membres CA...');
  for (const ca of CA_EMAILS) {
    const result = await User.findOneAndUpdate(
      { firstName: ca.firstName, lastName: ca.lastName },
      { email: ca.email, position: ca.position },
      { new: true }
    );
    if (result) {
      console.log(`✅ ${ca.firstName} ${ca.lastName} → ${ca.email}`);
    } else {
      // Créer si n'existe pas
      await User.create({
        ...ca,
        password: 'Acafis2026!',
        isActive: true,
      });
      console.log(`➕ Créé : ${ca.firstName} ${ca.lastName} → ${ca.email}`);
    }
  }

  // ── Mettre à jour les acquéreurs ──
  console.log('\n📧 Mise à jour emails acquéreurs...');
  for (const acq of ACQUEREUR_EMAILS) {
    const result = await Member.findOneAndUpdate(
      { memberNumber: acq.memberNumber },
      { email: acq.email },
      { new: true }
    );
    if (result) {
      console.log(`✅ ${acq.memberNumber} → ${acq.email}`);
    }
  }

  console.log('\n🎉 Emails mis à jour avec succès !');
  console.log('\n📋 Membres CA configurés :');
  CA_EMAILS.forEach(ca => console.log(`   • ${ca.firstName} ${ca.lastName} (${ca.position}) → ${ca.email}`));

  process.exit(0);
};

updateEmails().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});