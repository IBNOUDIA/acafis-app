const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Payment = require('../models/Payment');

router.use(protect);

// Tous les paiements
router.get('/', authorize('super_admin','admin','admin_finance'), async (req, res) => {
  try {
    const { memberId, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (memberId) query.member = memberId;
    if (status)   query.status = status;

    const total    = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('member', 'firstName lastName memberNumber')
      .populate('confirmedBy', 'firstName lastName')
      .sort({ paymentDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Créer paiement
router.post('/', authorize('super_admin','admin','admin_finance'), async (req, res) => {
  try {
    const payment = await Payment.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Paiement enregistré', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Confirmer paiement
router.put('/:id/confirm', authorize('super_admin','admin_finance'), async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmé', confirmedAt: new Date(), confirmedBy: req.user._id },
      { new: true }
    );
    if (!payment) return res.status(404).json({ success: false, message: 'Paiement introuvable' });
    res.status(200).json({ success: true, message: 'Paiement confirmé', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Statistiques financières
router.get('/stats', authorize('super_admin','admin','admin_finance'), async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      { $match: { status: 'confirmé' } },
      { $group: {
        _id: null,
        totalCollecté: { $sum: '$amount' },
        nombrePaiements: { $sum: 1 },
        moyennePaiement: { $avg: '$amount' }
      }}
    ]);
    res.status(200).json({ success: true, stats: stats[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
