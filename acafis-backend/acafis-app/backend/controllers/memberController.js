const Member = require('../models/Member');

// @desc    Tous les membres
// @route   GET /api/members
// @access  Private (CA)
exports.getMembers = async (req, res) => {
  try {
    const { status, financialStatus, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (financialStatus) query['financial.status'] = financialStatus;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName:  { $regex: search, $options: 'i' } },
        { memberNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Member.countDocuments(query);
    const members = await Member.find(query)
      .populate('user', 'firstName lastName email avatar')
      .sort({ memberNumber: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: members.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      members
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Un membre
// @route   GET /api/members/:id
// @access  Private
exports.getMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('user', 'firstName lastName email avatar role');

    if (!member) {
      return res.status(404).json({ success: false, message: 'Membre introuvable' });
    }

    res.status(200).json({ success: true, member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Créer un membre
// @route   POST /api/members
// @access  Private (Admin+)
exports.createMember = async (req, res) => {
  try {
    // Générer numéro de membre automatiquement
    const count = await Member.countDocuments();
    const memberNumber = `ACQ-${String(count + 1).padStart(3, '0')}`;

    const member = await Member.create({ ...req.body, memberNumber });

    res.status(201).json({ success: true, message: 'Membre créé avec succès', member });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Ce membre existe déjà' });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Modifier un membre
// @route   PUT /api/members/:id
// @access  Private (Admin+)
exports.updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Membre introuvable' });
    }

    res.status(200).json({ success: true, message: 'Membre mis à jour', member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Statistiques membres
// @route   GET /api/members/stats
// @access  Private (Admin+)
exports.getMemberStats = async (req, res) => {
  try {
    const stats = await Member.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          actifs: { $sum: { $cond: [{ $eq: ['$status', 'actif'] }, 1, 0] } },
          aJour: { $sum: { $cond: [{ $eq: ['$financial.status', 'à_jour'] }, 1, 0] } },
          enRetard: { $sum: { $cond: [{ $in: ['$financial.status', ['retard_mineur', 'retard_majeur']] }, 1, 0] } },
          totalCollecte: { $sum: '$financial.paidAmount' },
          totalAttendu:  { $sum: '$financial.totalAmount' },
        }
      }
    ]);

    res.status(200).json({ success: true, stats: stats[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
