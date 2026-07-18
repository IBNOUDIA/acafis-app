require('dotenv').config();
const PDFDocument = require('pdfkit');
const fs          = require('fs');
const path        = require('path');
const mongoose    = require('mongoose');
const Payment     = require('../models/Payment');
const Member      = require('../models/Member');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connecté');
};

const formatMontant = (n) =>
  n.toLocaleString('fr-FR') + ' FCFA';

const generateReport = async () => {
  await connectDB();

  // Récupérer données
  const payments = await Payment.find({ status: 'confirmé' })
    .populate('member', 'firstName lastName memberNumber')
    .sort({ paymentDate: 1 });

  const members = await Member.find().sort({ memberNumber: 1 });

  // Données BHS
  const BHS = {
    soldeDebut:   6909110,
    totalCredits:  920200,
    totalDebits:  4011900,
    soldeFinal:   3817410,
    compte:       '0 64 512722 L00',
    iban:         'SN08 SN039010 0106 4512 7223 0074',
    periode:      'du 01/01/2026 au 13/07/2026',
  };

  // Créer PDF
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const outputPath = path.join(__dirname, '../rapports/rapport_financier_AG_2026.pdf');

  // Créer dossier rapports si inexistant
  if (!fs.existsSync(path.join(__dirname, '../rapports'))) {
    fs.mkdirSync(path.join(__dirname, '../rapports'));
  }

  doc.pipe(fs.createWriteStream(outputPath));

  // ══ EN-TÊTE ══
  doc.rect(0, 0, 612, 120).fill('#1a3a6b');
  doc.fillColor('#c9973a').fontSize(22).font('Helvetica-Bold')
     .text('COOPÉRATIVE D\'HABITAT ACAFIS', 50, 30, { align: 'center' });
  doc.fillColor('#ffffff').fontSize(14).font('Helvetica')
     .text('RAPPORT FINANCIER — ASSEMBLÉE GÉNÉRALE', 50, 58, { align: 'center' });
  doc.fillColor('rgba(255,255,255,0.7)').fontSize(11)
     .text('1er août 2026 | Jitsi Meet', 50, 80, { align: 'center' });
  doc.fillColor('rgba(255,255,255,0.5)').fontSize(9)
     .text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 50, 98, { align: 'center' });

  doc.moveDown(4);

  // ══ COMPTE BHS ══
  doc.fillColor('#1a3a6b').fontSize(14).font('Helvetica-Bold')
     .text('1. COMPTE BHS — BANQUE DE L\'HABITAT DU SÉNÉGAL', 50, 140);
  doc.moveTo(50, 158).lineTo(562, 158).strokeColor('#c9973a').lineWidth(2).stroke();

  doc.moveDown(0.5);

  // Info compte
  doc.fillColor('#666666').fontSize(9).font('Helvetica')
     .text(`Compte : ${BHS.compte}   |   IBAN : ${BHS.iban}`, 50, 165)
     .text(`Période : ${BHS.periode}`, 50, 178);

  // Tableau soldes
  const tableTop = 200;
  const cols = [50, 200, 350, 480];

  // Header tableau
  doc.rect(50, tableTop, 512, 22).fill('#1a3a6b');
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
     .text('Description', cols[0] + 5, tableTop + 6)
     .text('Montant (FCFA)', cols[2] + 5, tableTop + 6)
     .text('Statut', cols[3] + 5, tableTop + 6);

  const rows = [
    ['Solde au 01/01/2026', '', formatMontant(BHS.soldeDebut), 'Reporté'],
    ['Total cotisations reçues', '', formatMontant(BHS.totalCredits), '✓ Crédité'],
    ['Total dépenses (Architecture)', '', formatMontant(BHS.totalDebits), 'Débité'],
    ['SOLDE AU 13/07/2026', '', formatMontant(BHS.soldeFinal), '✓ Actuel'],
  ];

  rows.forEach((row, i) => {
    const y = tableTop + 22 + i * 22;
    doc.rect(50, y, 512, 22).fill(i % 2 === 0 ? '#f8f5ef' : '#ffffff');
    doc.fillColor(i === 3 ? '#1a3a6b' : '#333333')
       .fontSize(9)
       .font(i === 3 ? 'Helvetica-Bold' : 'Helvetica')
       .text(row[0], cols[0] + 5, y + 6)
       .text(row[2], cols[2] + 5, y + 6)
       .fillColor(i === 3 ? '#2d6a4f' : '#666666')
       .text(row[3], cols[3] + 5, y + 6);
  });

  doc.moveDown(7);

  // ══ TRANSACTIONS ══
  doc.fillColor('#1a3a6b').fontSize(14).font('Helvetica-Bold')
     .text('2. DÉTAIL DES TRANSACTIONS', 50, 320);
  doc.moveTo(50, 338).lineTo(562, 338).strokeColor('#c9973a').lineWidth(2).stroke();

  // Header transactions
  const tTop = 348;
  doc.rect(50, tTop, 512, 22).fill('#1a3a6b');
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
     .text('Date', 55, tTop + 7)
     .text('Référence', 120, tTop + 7)
     .text('Membre', 210, tTop + 7)
     .text('Type', 340, tTop + 7)
     .text('Montant', 430, tTop + 7)
     .text('Statut', 500, tTop + 7);

  payments.forEach((p, i) => {
    const y = tTop + 22 + i * 20;
    doc.rect(50, y, 512, 20).fill(i % 2 === 0 ? '#f8f5ef' : '#ffffff');
    doc.fillColor('#333333').fontSize(8).font('Helvetica')
       .text(new Date(p.paymentDate).toLocaleDateString('fr-FR'), 55, y + 6)
       .text(p.reference?.substring(0, 12) || '—', 120, y + 6)
       .text(`${p.member?.firstName} ${p.member?.lastName}`.substring(0, 18), 210, y + 6)
       .text(p.type, 340, y + 6)
       .fillColor('#2d6a4f').font('Helvetica-Bold')
       .text(p.amount.toLocaleString('fr-FR'), 430, y + 6)
       .fillColor('#2d6a4f')
       .text('✓ Confirmé', 500, y + 6);
  });

  const afterTransactions = tTop + 22 + payments.length * 20 + 20;

  // ══ MEMBRES ══
  doc.fillColor('#1a3a6b').fontSize(14).font('Helvetica-Bold')
     .text('3. ÉTAT DES ACQUÉREURS', 50, afterTransactions);
  doc.moveTo(50, afterTransactions + 18).lineTo(562, afterTransactions + 18)
     .strokeColor('#c9973a').lineWidth(2).stroke();

  const mTop = afterTransactions + 28;
  doc.rect(50, mTop, 512, 22).fill('#1a3a6b');
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
     .text('N°', 55, mTop + 7)
     .text('Nom', 85, mTop + 7)
     .text('Montant dû', 260, mTop + 7)
     .text('Payé', 340, mTop + 7)
     .text('Solde', 410, mTop + 7)
     .text('Statut', 480, mTop + 7);

  members.forEach((m, i) => {
    const y = mTop + 22 + i * 18;
    doc.rect(50, y, 512, 18).fill(i % 2 === 0 ? '#f8f5ef' : '#ffffff');
    const statusColor = m.financial.status === 'à_jour' ? '#2d6a4f' : '#c0392b';
    doc.fillColor('#333333').fontSize(7.5).font('Helvetica')
       .text(m.memberNumber, 55, y + 5)
       .text(`${m.firstName} ${m.lastName}`, 85, y + 5)
       .text(m.financial.totalAmount.toLocaleString('fr-FR'), 260, y + 5)
       .text(m.financial.paidAmount.toLocaleString('fr-FR'), 340, y + 5)
       .text(m.financial.balance.toLocaleString('fr-FR'), 410, y + 5)
       .fillColor(statusColor)
       .text(m.financial.status, 480, y + 5);
  });

  // ══ DÉPENSES ══
  const depTop = mTop + 22 + members.length * 18 + 20;
  doc.fillColor('#1a3a6b').fontSize(14).font('Helvetica-Bold')
     .text('4. DÉPENSES ENGAGÉES', 50, depTop);
  doc.moveTo(50, depTop + 18).lineTo(562, depTop + 18)
     .strokeColor('#c9973a').lineWidth(2).stroke();

  const depenses = [
    { date: '25/02/2026', ref: 'Z0158943089', desc: 'Studio Architecture Amadou M. SAR — Acompte 1', montant: 2500000 },
    { date: '05/03/2026', ref: 'Z0159938475', desc: 'Studio Architecture Amadou M. SAR — Acompte 2', montant: 1500000 },
    { date: '25/02/2026', ref: 'Z0158943089', desc: 'Frais sur virement émis', montant: 5850 },
    { date: '05/03/2026', ref: 'Z0159938475', desc: 'Frais sur virement émis', montant: 5850 },
    { date: '17/06/2026', ref: 'Z0166542580', desc: 'Droit de timbre virement', montant: 200 },
  ];

  const dTop = depTop + 28;
  doc.rect(50, dTop, 512, 20).fill('#1a3a6b');
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
     .text('Date', 55, dTop + 6)
     .text('Référence', 110, dTop + 6)
     .text('Description', 190, dTop + 6)
     .text('Montant FCFA', 460, dTop + 6);

  depenses.forEach((d, i) => {
    const y = dTop + 20 + i * 18;
    doc.rect(50, y, 512, 18).fill(i % 2 === 0 ? '#f8f5ef' : '#ffffff');
    doc.fillColor('#333333').fontSize(7.5).font('Helvetica')
       .text(d.date, 55, y + 5)
       .text(d.ref, 110, y + 5)
       .text(d.desc, 190, y + 5)
       .fillColor('#c0392b').font('Helvetica-Bold')
       .text(d.montant.toLocaleString('fr-FR'), 460, y + 5);
  });

  // ══ PIED DE PAGE ══
  const footerY = dTop + 20 + depenses.length * 18 + 30;
  doc.rect(50, footerY, 512, 60).fill('#f8f5ef')
     .rect(50, footerY, 4, 60).fill('#c9973a');

  doc.fillColor('#1a3a6b').fontSize(10).font('Helvetica-Bold')
     .text('RÉSUMÉ POUR L\'AG DU 1ER AOÛT 2026', 65, footerY + 10);
  doc.fillColor('#333333').fontSize(9).font('Helvetica')
     .text(`Solde compte BHS : ${formatMontant(BHS.soldeFinal)}   |   Cotisations reçues : ${formatMontant(BHS.totalCredits)}   |   Dépenses architecture : ${formatMontant(4011900)}`, 65, footerY + 28);
  doc.fillColor('#666666').fontSize(8)
     .text('Préparé par : Amar Dia — Programmeur-Analyste | Superviseur : Omar Cissé | ACAFIS © 2026', 65, footerY + 46);

  doc.end();

  console.log('\n🎉 Rapport PDF généré !');
  console.log(`📄 Fichier : backend/rapports/rapport_financier_AG_2026.pdf`);
  process.exit(0);
};

generateReport().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});