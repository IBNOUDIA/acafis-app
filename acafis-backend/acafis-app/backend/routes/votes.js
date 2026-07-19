const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Vote    = require('../models/Vote');
const Meeting = require('../models/Meeting');

// @desc  Créer une résolution à voter
// @route POST /api/votes
router.post('/', protect, authorize('super_admin', 'admin'), async (req, res) => {
  try {
    const { meetingId, title, description } = req.body;
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ success: false, message: 'Réunion introuvable' });

    const vote = await Vote.create({
      meeting:    meetingId,
      resolution: { title, description, status: 'ouverte' },
      createdBy:  req.user._id,
    });

    // Notifier via Socket.io
    const io = req.app.get('io');
    if (io) io.emit('vote:created', { vote, meetingId });

    res.status(201).json({ success: true, message: 'Vote créé', vote });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// @desc  Voter
// @route POST /api/votes/:id/voter
router.post('/:id/voter', protect, async (req, res) => {
  try {
    const { choix, procuration, procurationDe } = req.body;

    if (!['pour', 'contre', 'abstention'].includes(choix)) {
      return res.status(400).json({ success: false, message: 'Choix invalide' });
    }

    const vote = await Vote.findById(req.params.id);
    if (!vote) return res.status(404).json({ success: false, message: 'Vote introuvable' });
    if (vote.resolution.status !== 'ouverte') {
      return res.status(400).json({ success: false, message: 'Ce vote est fermé' });
    }

    // Vérifier si déjà voté
    const dejaVote = vote.votes.find(v => v.user.toString() === req.user._id.toString());
    if (dejaVote) {
      return res.status(400).json({ success: false, message: 'Vous avez déjà voté' });
    }

    // Ajouter le vote
    vote.votes.push({
      user:          req.user._id,
      choix,
      votedAt:       new Date(),
      procuration:   procuration || false,
      procurationDe: procurationDe || null,
    });

    // Calculer résultats
    vote.results.pour       = vote.votes.filter(v => v.choix === 'pour').length;
    vote.results.contre     = vote.votes.filter(v => v.choix === 'contre').length;
    vote.results.abstention = vote.votes.filter(v => v.choix === 'abstention').length;
    vote.results.total      = vote.votes.length;

    await vote.save();

    // Notifier en temps réel
    const io = req.app.get('io');
    if (io) io.emit('vote:updated', { voteId: vote._id, results: vote.results });

    res.status(200).json({ success: true, message: `Vote "${choix}" enregistré`, results: vote.results });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// @desc  Fermer un vote et calculer résultat final
// @route PUT /api/votes/:id/fermer
router.put('/:id/fermer', protect, authorize('super_admin', 'admin'), async (req, res) => {
  try {
    const vote = await Vote.findById(req.params.id).populate('votes.user', 'firstName lastName');
    if (!vote) return res.status(404).json({ success: false, message: 'Vote introuvable' });

    vote.resolution.status = 'fermée';
    vote.closedAt          = new Date();

    // Résultat final
    const majorite = vote.results.pour > vote.results.contre;
    vote.results.resultat       = majorite ? 'adoptée' : 'rejetée';
    vote.resolution.status      = vote.results.resultat;

    // Ajouter dans les résolutions de la réunion
    await Meeting.findByIdAndUpdate(vote.meeting, {
      $push: {
        resolutions: {
          title:        vote.resolution.title,
          description:  vote.resolution.description,
          votesFor:     vote.results.pour,
          votesAgainst: vote.results.contre,
          abstentions:  vote.results.abstention,
          result:       vote.results.resultat,
        }
      }
    });

    await vote.save();

    // Notifier
    const io = req.app.get('io');
    if (io) io.emit('vote:closed', { voteId: vote._id, resultat: vote.results.resultat, results: vote.results });

    res.status(200).json({ success: true, message: `Vote fermé — Résultat : ${vote.results.resultat}`, vote });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// @desc  Votes d'une réunion
// @route GET /api/votes/meeting/:meetingId
router.get('/meeting/:meetingId', protect, async (req, res) => {
  try {
    const votes = await Vote.find({ meeting: req.params.meetingId })
      .populate('createdBy', 'firstName lastName')
      .populate('votes.user', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, votes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// @desc  Détail d'un vote
// @route GET /api/votes/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const vote = await Vote.findById(req.params.id)
      .populate('votes.user', 'firstName lastName position');
    if (!vote) return res.status(404).json({ success: false, message: 'Vote introuvable' });
    res.status(200).json({ success: true, vote });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;