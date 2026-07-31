const PDFDocument = require('pdfkit');

const GREEN = '#00853F';
const GREY  = '#666666';

function money(n) {
  return (n || 0).toLocaleString('fr-FR') + ' FCFA';
}

const TYPE_LABEL = {
  part_social: 'Part social',
  cotisation:  'Cotisation',
  acompte:     'Acompte',
  solde:       'Solde',
  frais_admin: 'Frais administratifs',
  autre:       'Autre',
};

const METHOD_LABEL = {
  virement_interac:  'Virement Interac',
  virement_bancaire: 'Virement bancaire',
  cheque:            'Chèque',
  especes:            'Espèces',
  autre:              'Autre',
};

// Génère le reçu PDF d'un paiement confirmé et l'envoie en stream HTTP.
function streamReceiptPdf(payment, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Recu_${payment._id}.pdf"`);
  doc.pipe(res);

  doc.fontSize(11).fillColor('#333').text('COOPÉRATIVE ACAFIS', { align: 'center' });
  doc.fontSize(9).fillColor(GREY).text("Association Canadienne d'Aide à la Famille Immigrante Sénégalaise", { align: 'center' });
  doc.moveDown(0.3);
  doc.strokeColor(GREEN).lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1);

  doc.fontSize(20).fillColor(GREEN).text('REÇU DE PAIEMENT', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor(GREY).text(`N° ${payment._id}`, { align: 'center' });
  doc.moveDown(1.5);

  function row(label, value, opts = {}) {
    const y = doc.y;
    doc.fontSize(10).fillColor(opts.bold ? '#000' : '#333')
      .font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
      .text(label, 55, y, { continued: false, width: 250 });
    doc.font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
      .text(value, 320, y, { width: 225, align: 'right' });
    doc.moveDown(0.5);
  }

  row('Membre', `${payment.member.firstName} ${payment.member.lastName} (${payment.member.memberNumber})`);
  row('Date du paiement', new Date(payment.paymentDate).toLocaleDateString('fr-FR'));
  row('Type', TYPE_LABEL[payment.type] || payment.type);
  row('Méthode', METHOD_LABEL[payment.method] || payment.method);
  if (payment.reference) row('Référence', payment.reference);
  doc.moveDown(0.5);
  row('MONTANT', money(payment.amount), { bold: true });
  doc.moveDown(1.5);

  doc.fontSize(9).fillColor(GREY).text(
    `Reçu émis le ${new Date().toLocaleDateString('fr-FR')} — Paiement confirmé le ${new Date(payment.confirmedAt || payment.paymentDate).toLocaleDateString('fr-FR')}.`
  );

  doc.moveDown(3);
  const sigY = doc.y;
  doc.fontSize(10).fillColor('#333');
  doc.moveTo(320, sigY).lineTo(495, sigY).stroke();
  doc.text('Bintou Sarr, Trésorière', 320, sigY + 5);

  doc.fontSize(8).fillColor(GREY).text(
    "Coopérative ACAFIS | 4A rue du Collège, Sainte-Brigitte-de-Laval, Qc, Canada, G0A 3K0",
    50, 780, { align: 'center', width: 495 }
  );
  doc.text('president@coop-acafis.com | infos@coop-acafis.com | coop-acafis.com',
    50, 792, { align: 'center', width: 495 });

  doc.end();
}

module.exports = { streamReceiptPdf };
