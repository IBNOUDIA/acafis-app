const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  description:  { type: String },
  category: {
    type: String,
    enum: ['pv_reunion', 'rapport_financier', 'statuts', 'contrat', 'convocation', 'resolution', 'photo_chantier', 'autre'],
    required: true
  },
  fileUrl:      { type: String, required: true },
  fileType:     { type: String },   // pdf, jpg, docx...
  fileSize:     { type: Number },   // en bytes
  // Accès
  visibility: {
    type: String,
    enum: ['public', 'ca_only', 'acquereurs', 'finance_only'],
    default: 'ca_only'
  },
  // Lié à une réunion ?
  meeting:      { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' },
  // Lié à un membre ?
  member:       { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  tags:         [{ type: String }],
  version:      { type: Number, default: 1 },
  isArchived:   { type: Boolean, default: false },
  uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
