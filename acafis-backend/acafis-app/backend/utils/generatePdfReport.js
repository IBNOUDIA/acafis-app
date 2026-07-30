const PDFDocument = require('pdfkit');

const GREEN = '#00853F';
const YELLOW = '#FDEF42';
const RED = '#E31B23';
const GREY = '#666666';

function money(n) {
  return (n || 0).toLocaleString('fr-FR') + ' FCFA';
}

// Génère le PDF et l'envoie directement dans la réponse HTTP (stream).
function streamFinancialPdf(data, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="Rapport_Financier_ACAFIS.pdf"');
  doc.pipe(res);

  // En-tête
  doc.fontSize(11).fillColor('#333').text('COOPÉRATIVE ACAFIS', { align: 'center' });
  doc.fontSize(9).fillColor(GREY).text("Association Canadienne d'Aide à la Famille Immigrante Sénégalaise", { align: 'center' });
  doc.moveDown(0.3);
  doc.strokeColor(RED).lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1);

  doc.fontSize(22).fillColor(GREEN).text('RAPPORT FINANCIER', { align: 'center' });
  doc.fontSize(12).fillColor('#333').text('Assemblée Générale — 1er août 2026', { align: 'center' });
  doc.moveDown(1.5);

  function sectionTitle(text) {
    doc.moveDown(0.5);
    doc.fontSize(13).fillColor(GREEN).text(text.toUpperCase());
    doc.strokeColor(GREEN).lineWidth(1).moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).stroke();
    doc.moveDown(0.5);
  }

  function row(label, value, opts = {}) {
    const y = doc.y;
    doc.fontSize(10).fillColor(opts.bold ? '#000' : '#333')
      .font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
      .text(label, 55, y, { continued: false, width: 350 });
    doc.font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
      .text(value, 400, y, { width: 145, align: 'right' });
    doc.moveDown(0.4);
  }

  // 1. Solde et résumé
  sectionTitle('1. Solde et résumé');
  doc.fontSize(9).fillColor(GREY).text(`Compte BHS ${data.bhs.compte}`);
  doc.moveDown(0.3);
  row(`Solde d'ouverture (${data.bhs.dateDebut})`, money(data.bhs.soldeDebut));
  row('Total des recettes de la période', money(data.recettes.totalCollecte));
  row('Total des dépenses de la période', money(data.totalDepenses));
  row(`SOLDE DE CLÔTURE (${data.bhs.dateFinal})`, money(data.bhs.soldeFinal), { bold: true });

  // 2. Recettes
  sectionTitle('2. Recettes de la période');
  row('Cotisations reçues (paiements confirmés)', money(data.recettes.totalCollecte));
  row('Nombre de paiements', String(data.recettes.nombrePaiements));

  // 3. Dépenses par commission
  sectionTitle('3. Dépenses par commission');
  row('Habitat', money(data.depensesParCommission.habitat));
  row('Finance', money(data.depensesParCommission.finance));
  row('Communication', money(data.depensesParCommission.communication));
  row('Juridique', money(data.depensesParCommission.juridique));
  row('TOTAL DÉPENSES', money(data.totalDepenses), { bold: true });

  // 4. État des cotisations membres
  sectionTitle('4. État des cotisations — Membres');
  row('Total membres', String(data.membres.total));
  row('Membres à jour', String(data.membres.aJour));
  row('Retard mineur', String(data.membres.retardMineur));
  row('Retard majeur', String(data.membres.retardMajeur));
  row('Montant total attendu (part social + cotisations)', money(data.membres.totalAttendu));

  // 5. Observations
  sectionTitle('5. Observations et recommandations');
  doc.moveDown(2);

  // Signatures
  doc.moveDown(2);
  const sigY = doc.y;
  doc.fontSize(10).fillColor('#333');
  doc.moveTo(55, sigY).lineTo(230, sigY).stroke();
  doc.text('Bintou Sarr, Trésorière', 55, sigY + 5);
  doc.moveTo(320, sigY).lineTo(495, sigY).stroke();
  doc.text('Omar Sarr, Président', 320, sigY + 5);

  // Pied de page
  doc.fontSize(8).fillColor(GREY).text(
    "Coopérative ACAFIS | 4A rue du Collège, Sainte-Brigitte-de-Laval, Qc, Canada, G0A 3K0",
    50, 780, { align: 'center', width: 495 }
  );
  doc.text('president@coop-acafis.com | infos@coop-acafis.com | coop-acafis.com',
    50, 792, { align: 'center', width: 495 });

  doc.end();
}

module.exports = { streamFinancialPdf };