const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Document = require('../models/Document');

router.use(protect);

// Tous les documents
router.get('/', async (req, res) => {
  try {
    const { category, visibility } = req.query;
    const query = { isArchived: false };
    if (category)   query.category   = category;
    if (visibility) query.visibility = visibility;

    // Filtrer selon rôle
    if (!['super_admin','admin'].includes(req.user.role)) {
      query.visibility = { $in: ['public', 'acquereurs'] };
    }

    const documents = await Document.find(query)
      .populate('uploadedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: documents.length, documents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Uploader document
router.post('/', authorize('super_admin','admin','admin_finance','membre_ca'), async (req, res) => {
  try {
    const document = await Document.create({ ...req.body, uploadedBy: req.user._id });
    res.status(201).json({ success: true, message: 'Document ajouté', document });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Supprimer document
router.delete('/:id', authorize('super_admin','admin'), async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(req.params.id, { isArchived: true }, { new: true });
    if (!document) return res.status(404).json({ success: false, message: 'Document introuvable' });
    res.status(200).json({ success: true, message: 'Document archivé' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
