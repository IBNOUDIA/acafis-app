const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { sendConvocation }    = require('../services/emailService');
const Meeting = require('../models/Meeting');
const User    = require('../models/User');

// @desc  Envoyer convocations pour une réunion
// @route POST /api/convocations/:meetingId
router.post('/:meetingId', protect, authorize('super_admin', 'admin'), async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Réunion introuvable' });
    }

    // Récupérer tous les membres CA actifs
    const users = await User.find({
      role: { $in: ['super_admin', 'admin', 'admin_finance', 'membre_ca'] },
      isActive: true
    });

    const results = [];
    let success = 0;
    let errors  = 0;

    for (const user of users) {
      try {
        await sendConvocation({
          to:      user.email,
          name:    `${user.firstName} ${user.lastName}`,
          meeting: meeting,
        });
        results.push({ email: user.email, name: `${user.firstName} ${user.lastName}`, status: 'envoyé' });
        success++;
      } catch (err) {
        results.push({ email: user.email, name: `${user.firstName} ${user.lastName}`, status: 'erreur', error: err.message });
        errors++;
      }
    }

    // Marquer convocation comme envoyée
    meeting.convocationSent = true;
    meeting.convocationDate = new Date();
    await meeting.save();

    res.status(200).json({
      success: true,
      message: `Convocations envoyées : ${success} succès, ${errors} erreur(s)`,
      total:   users.length,
      success: success,
      errors:  errors,
      results,
    });

  } catch (err) {
    console.error('Convocation error:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi des convocations' });
  }
});

// @desc  Envoyer convocation à un seul membre (test)
// @route POST /api/convocations/:meetingId/test
router.post('/:meetingId/test', protect, authorize('super_admin', 'admin'), async (req, res) => {
  try {
    const { email, name } = req.body;
    const meeting = await Meeting.findById(req.params.meetingId);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Réunion introuvable' });
    }

    await sendConvocation({ to: email, name, meeting });

    res.status(200).json({
      success: true,
      message: `Convocation de test envoyée à ${email}`
    });
  } catch (err) {
    console.error('Test convocation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;