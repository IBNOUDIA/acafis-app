const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Expense = require('../models/Expense');

router.use(protect);

// Toutes les dépenses (filtrable par commission)
router.get('/', authorize('super_admin','admin','admin_finance'), async (req, res) => {
  try {
    const { commission, page = 1, limit = 50 } = req.query;
    const query = {};
    if (commission) query.commission = commission;

    const total    = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Totaux par commission (pour le rapport financier)
router.get('/stats', authorize('super_admin','admin','admin_finance'), async (req, res) => {
  try {
    const stats = await Expense.aggregate([
      { $group: { _id: '$commission', total: { $sum: '$amount' }, nombre: { $sum: 1 } } },
    ]);
    const parCommission = { habitat: 0, finance: 0, communication: 0, juridique: 0 };
    let totalGeneral = 0;
    stats.forEach(s => { parCommission[s._id] = s.total; totalGeneral += s.total; });

    res.status(200).json({ success: true, parCommission, totalGeneral });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Créer une dépense
router.post('/', authorize('super_admin','admin_finance'), async (req, res) => {
  try {
    const expense = await Expense.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Dépense enregistrée', expense });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Modifier une dépense
router.put('/:id', authorize('super_admin','admin_finance'), async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!expense) return res.status(404).json({ success: false, message: 'Dépense introuvable' });
    res.status(200).json({ success: true, message: 'Dépense mise à jour', expense });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Supprimer une dépense
router.delete('/:id', authorize('super_admin','admin_finance'), async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Dépense introuvable' });
    res.status(200).json({ success: true, message: 'Dépense supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;