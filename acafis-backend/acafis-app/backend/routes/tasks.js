const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Task = require('../models/Task');

router.use(protect);
router.use(authorize('super_admin', 'admin', 'admin_finance', 'membre_ca'));

// Toutes les taches (grille de suivi)
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ isArchived: false }).sort({ order: 1, createdAt: 1 });
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Creer une tache
router.post('/', async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Tâche ajoutée', task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Modifier une tache (titre, phase, statut, responsable, echeance)
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!task) return res.status(404).json({ success: false, message: 'Tâche introuvable' });
    res.status(200).json({ success: true, message: 'Tâche mise à jour', task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Ajouter une note (historique d'avancement, ex: a chaque reunion)
router.post('/:id/notes', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Texte de la note requis' });

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: { text, author: `${req.user.firstName} ${req.user.lastName}` } } },
      { new: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Tâche introuvable' });
    res.status(200).json({ success: true, message: 'Note ajoutée', task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Archiver une tache
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { isArchived: true }, { new: true });
    if (!task) return res.status(404).json({ success: false, message: 'Tâche introuvable' });
    res.status(200).json({ success: true, message: 'Tâche archivée' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
