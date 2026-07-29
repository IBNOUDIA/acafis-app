const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
} = require('docx');

const GREEN = '00853F';
const RED = 'E31B23';
const DARKGREY = '333333';
const LIGHTGREY = 'F2F2F2';
const USABLE_WIDTH = 9906;

function money(n) {
  return (n || 0).toLocaleString('fr-FR') + ' FCFA';
}

function sectionTitle(text) {
  return new Paragraph({
    spacing: { before: 300, after: 150 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GREEN, space: 4 } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 24, color: GREEN })],
  });
}

function twoColRow(label, value, widths, shaded, bold) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: widths[0], type: WidthType.DXA },
        shading: shaded ? { type: ShadingType.CLEAR, fill: LIGHTGREY } : undefined,
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: !!bold })] })],
      }),
      new TableCell({
        width: { size: widths[1], type: WidthType.DXA },
        shading: shaded ? { type: ShadingType.CLEAR, fill: LIGHTGREY } : undefined,
        children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: value, bold: !!bold })] })],
      }),
    ],
  });
}

// Construit le document et retourne un Buffer prêt à être envoyé/téléchargé.
async function buildFinancialDocx(data) {
  const w = [Math.round(USABLE_WIDTH * 0.6), Math.round(USABLE_WIDTH * 0.4)];

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } } },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
          children: [new TextRun({ text: 'COOPÉRATIVE ACAFIS', bold: true, size: 20, color: DARKGREY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: RED, space: 8 } },
          children: [new TextRun({ text: "Association Canadienne d'Aide à la Famille Immigrante Sénégalaise", size: 16, italics: true, color: DARKGREY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 300, after: 100 },
          children: [new TextRun({ text: 'RAPPORT FINANCIER', bold: true, size: 40, color: GREEN })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 },
          children: [new TextRun({ text: 'Assemblée Générale — 1er août 2026', size: 24, color: DARKGREY })] }),

        sectionTitle('1. Solde et résumé'),
        new Table({ width: { size: USABLE_WIDTH, type: WidthType.DXA }, columnWidths: w, rows: [
          twoColRow(`Solde d'ouverture (${data.bhs.dateDebut})`, money(data.bhs.soldeDebut), w, true),
          twoColRow('Total des recettes de la période', money(data.recettes.totalCollecte), w, false),
          twoColRow('Total des dépenses de la période', money(data.totalDepenses), w, true),
          twoColRow(`SOLDE DE CLÔTURE (${data.bhs.dateFinal})`, money(data.bhs.soldeFinal), w, false, true),
        ] }),

        sectionTitle('2. Recettes de la période'),
        new Table({ width: { size: USABLE_WIDTH, type: WidthType.DXA }, columnWidths: w, rows: [
          twoColRow('Cotisations reçues (paiements confirmés)', money(data.recettes.totalCollecte), w, true),
          twoColRow('Nombre de paiements', String(data.recettes.nombrePaiements), w, false),
        ] }),

        sectionTitle('3. Dépenses par commission'),
        new Table({ width: { size: USABLE_WIDTH, type: WidthType.DXA }, columnWidths: w, rows: [
          twoColRow('Habitat', money(data.depensesParCommission.habitat), w, true),
          twoColRow('Finance', money(data.depensesParCommission.finance), w, false),
          twoColRow('Communication', money(data.depensesParCommission.communication), w, true),
          twoColRow('Juridique', money(data.depensesParCommission.juridique), w, false),
          twoColRow('TOTAL DÉPENSES', money(data.totalDepenses), w, false, true),
        ] }),

        sectionTitle('4. État des cotisations — Membres'),
        new Table({ width: { size: USABLE_WIDTH, type: WidthType.DXA }, columnWidths: w, rows: [
          twoColRow('Total membres', String(data.membres.total), w, true),
          twoColRow('Membres à jour', String(data.membres.aJour), w, false),
          twoColRow('Retard mineur', String(data.membres.retardMineur), w, true),
          twoColRow('Retard majeur', String(data.membres.retardMajeur), w, false),
          twoColRow('Montant total attendu', money(data.membres.totalAttendu), w, true, true),
        ] }),

        sectionTitle('5. Observations et recommandations'),
        new Paragraph({ spacing: { after: 100 }, text: '' }),
        new Paragraph({ spacing: { after: 400 }, text: '' }),

        new Paragraph({ spacing: { before: 500, after: 300 }, text: '' }),
        new Table({
          width: { size: USABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [Math.round(USABLE_WIDTH * 0.5), Math.round(USABLE_WIDTH * 0.5)],
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          },
          rows: [new TableRow({ children: [
            new TableCell({ width: { size: Math.round(USABLE_WIDTH * 0.5), type: WidthType.DXA }, children: [
              new Paragraph({ spacing: { after: 400 }, text: '' }),
              new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: DARKGREY, space: 4 } }, children: [new TextRun('Bintou Sarr, Trésorière')] }),
            ] }),
            new TableCell({ width: { size: Math.round(USABLE_WIDTH * 0.5), type: WidthType.DXA }, children: [
              new Paragraph({ spacing: { after: 400 }, text: '' }),
              new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: DARKGREY, space: 4 } }, children: [new TextRun('Omar Sarr, Président')] }),
            ] }),
          ] })],
        }),

        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 500 },
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC', space: 8 } },
          children: [new TextRun({ text: 'Coopérative ACAFIS  |  4A rue du Collège, Sainte-Brigitte-de-Laval, Qc, Canada, G0A 3K0', size: 16, color: '888888' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'president@coop-acafis.com  |  infos@coop-acafis.com  |  coop-acafis.com', size: 16, color: '888888' })] }),
      ],
    }],
  });

  return Packer.toBuffer(doc);
}

module.exports = { buildFinancialDocx };