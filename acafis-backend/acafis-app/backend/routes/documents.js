const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { Readable } = require('stream');
const { protect, authorize } = require('../middleware/auth');
const Document   = require('../models/Document');
const Member     = require('../models/Member');
const cloudinary = require('../config/cloudinary');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const streamUpload = (buffer) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { folder: 'acafis-documents', resource_type: 'auto' },
    (error, result) => (error ? reject(error) : resolve(result))
  );
  Readable.from(buffer).pipe(stream);
});

router.use(protect);

// Mes documents (membre connecté)
router.get('/me', async (req, res) => {
  try {
    const member = await Member.findOne({ user: req.user._id });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Aucune fiche membre associée à ce compte' });
    }
    const documents = await Document.find({ member: member._id, isArchived: false }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Uploader un document (membre connecté)
router.post('/me', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Fichier manquant' });
    }
    const member = await Member.findOne({ user: req.user._id });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Aucune fiche membre associée à ce compte' });
    }

    const result = await streamUpload(req.file.buffer);

    const document = await Document.create({
      title:       req.body.title || req.file.originalname,
      category:    'autre',
      visibility:  'ca_only',
      fileUrl:     result.secure_url,
      fileType:    req.file.mimetype,
      fileSize:    req.file.size,
      member:      member._id,
      uploadedBy:  req.user._id,
    });

    res.status(201).json({ success: true, message: 'Document envoyé', document });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: "Erreur lors de l'envoi du fichier" });
  }
});

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
