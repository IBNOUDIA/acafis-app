const Meeting = require('../models/Meeting');

// @desc    Toutes les réunions
// @route   GET /api/meetings
// @access  Private
exports.getMeetings = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (type)   query.type   = type;
    if (status) query.status = status;

    const total    = await Meeting.countDocuments(query);
    const meetings = await Meeting.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('agenda.presenter', 'firstName lastName')
      .populate('attendees.user', 'firstName lastName avatar role')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ success: true, count: meetings.length, total, meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Une réunion
// @route   GET /api/meetings/:id
// @access  Private
exports.getMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('agenda.presenter', 'firstName lastName position')
      .populate('attendees.user', 'firstName lastName avatar role position')
      .populate('minutes.approvedBy', 'firstName lastName');

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Réunion introuvable' });
    }

    res.status(200).json({ success: true, meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Créer une réunion
// @route   POST /api/meetings
// @access  Private (Admin+)
exports.createMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.create({ ...req.body, createdBy: req.user._id });

    res.status(201).json({ success: true, message: 'Réunion créée avec succès', meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Modifier une réunion
// @route   PUT /api/meetings/:id
// @access  Private (Admin+)
exports.updateMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Réunion introuvable' });
    }

    res.status(200).json({ success: true, message: 'Réunion mise à jour', meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Enregistrer présence
// @route   POST /api/meetings/:id/attendance
// @access  Private
exports.markAttendance = async (req, res) => {
  try {
    const { userId, status } = req.body;
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Réunion introuvable' });
    }

    const existingIdx = meeting.attendees.findIndex(a => a.user.toString() === userId);

    if (existingIdx > -1) {
      meeting.attendees[existingIdx].status = status;
    } else {
      meeting.attendees.push({ user: userId, status, joinedAt: new Date() });
    }

    await meeting.save();
    res.status(200).json({ success: true, message: 'Présence enregistrée', meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Ajouter PV
// @route   PUT /api/meetings/:id/minutes
// @access  Private (Admin+)
exports.addMinutes = async (req, res) => {
  try {
    const { content, fileUrl } = req.body;
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Réunion introuvable' });
    }

    meeting.minutes = {
      content,
      fileUrl,
      approvedAt: new Date(),
      approvedBy: req.user._id
    };
    meeting.status = 'terminée';
    await meeting.save();

    res.status(200).json({ success: true, message: 'PV enregistré avec succès', meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Prochaine réunion
// @route   GET /api/meetings/next
// @access  Private
exports.getNextMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      date: { $gte: new Date() },
      status: { $in: ['planifiée', 'en_cours'] }
    })
    .populate('createdBy', 'firstName lastName')
    .sort({ date: 1 });

    res.status(200).json({ success: true, meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
