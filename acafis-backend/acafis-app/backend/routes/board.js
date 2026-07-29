const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const BoardMember = require('../models/BoardMember');

router.use(protect);

// Liste complète (visible à tous les utilisateurs connectés)
router.get('/', async (req, res) => {
  try {
    const members = await BoardMember.find({ active: true }).sort({ order: 1, lastName: 1 });
    res.status(200).json({ success: true, members });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Créer un membre du bureau
router.post('/', authorize('super_admin', 'admin'), async (req, res) => {
  try {
    const member = await BoardMember.create(req.body);
    res.status(201).json({ success: true, message: 'Membre du bureau ajouté', member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Modifier un membre du bureau (rôle, commission, LinkedIn...)
router.put('/:id', authorize('super_admin', 'admin'), async (req, res) => {
  try {
    const member = await BoardMember.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!member) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.status(200).json({ success: true, message: 'Membre mis à jour', member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Retirer un membre du bureau (désactivation, pas suppression définitive —
// utile après une AG pour garder l'historique)
router.delete('/:id', authorize('super_admin', 'admin'), async (req, res) => {
  try {
    const member = await BoardMember.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!member) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.status(200).json({ success: true, message: 'Membre retiré du bureau' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;