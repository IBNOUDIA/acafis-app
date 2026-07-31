const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Payment = require('../models/Payment');
const Member  = require('../models/Member');
const { streamReceiptPdf } = require('../utils/generateReceiptPdf');

router.use(protect);

// Reçu PDF d'un paiement confirmé (le membre concerné ou un admin)
router.get('/:id/receipt.pdf', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('member', 'firstName lastName memberNumber');
    if (!payment) return res.status(404).json({ success: false, message: 'Paiement introuvable' });

    const isAdmin = ['super_admin', 'admin', 'admin_finance'].includes(req.user.role);
    const isOwner = !isAdmin && await Member.exists({ _id: payment.member._id, user: req.user._id });
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    if (payment.status !== 'confirmé') {
      return res.status(400).json({ success: false, message: 'Reçu disponible uniquement pour les paiements confirmés' });
    }

    streamReceiptPdf(payment, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Historique des paiements du membre connecté
router.get('/me', async (req, res) => {
  try {
    const member = await Member.findOne({ user: req.user._id });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Aucune fiche membre associée à ce compte' });
    }
    const payments = await Payment.find({ member: member._id }).sort({ paymentDate: -1 });
    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

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
    await Payment.recalculerMembre(payment.member);
    res.status(201).json({ success: true, message: 'Paiement enregistré', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Modifier paiement (corriger montant, date, méthode, etc.)
router.put('/:id', authorize('super_admin','admin_finance'), async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!payment) return res.status(404).json({ success: false, message: 'Paiement introuvable' });
    await Payment.recalculerMembre(payment.member);
    res.status(200).json({ success: true, message: 'Paiement mis à jour', payment });
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
    await Payment.recalculerMembre(payment.member);
    res.status(200).json({ success: true, message: 'Paiement confirmé', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Supprimer paiement
router.delete('/:id', authorize('super_admin','admin_finance'), async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Paiement introuvable' });
    await Payment.recalculerMembre(payment.member);
    res.status(200).json({ success: true, message: 'Paiement supprimé' });
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