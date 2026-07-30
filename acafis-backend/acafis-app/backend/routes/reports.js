const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { gatherReportData } = require('../utils/reportData');
const { streamFinancialPdf } = require('../utils/generatePdfReport');
const { buildFinancialDocx } = require('../utils/generateDocxReport');

router.use(protect);
router.use(authorize('super_admin', 'admin', 'admin_finance'));

// Résumé JSON (pour un futur affichage dans Finance.jsx, en plus du fichier)
router.get('/summary', async (req, res) => {
  try {
    const data = await gatherReportData();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Rapport financier — PDF
router.get('/financial.pdf', async (req, res) => {
  try {
    const data = await gatherReportData();
    streamFinancialPdf(data, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur lors de la génération du PDF' });
  }
});

// Rapport financier — Word (.docx)
router.get('/financial.docx', async (req, res) => {
  try {
    const data = await gatherReportData();
    const buffer = await buildFinancialDocx(data);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="Rapport_Financier_ACAFIS.docx"');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur lors de la génération du Word' });
  }
});

module.exports = router;
