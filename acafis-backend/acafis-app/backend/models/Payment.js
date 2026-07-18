const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  member:       { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  amount:       { type: Number, required: true },
  currency:     { type: String, default: 'CAD' },
  type: {
    type: String,
    enum: ['cotisation', 'acompte', 'solde', 'frais_admin', 'autre'],
    required: true
  },
  method: {
    type: String,
    enum: ['virement_interac', 'virement_bancaire', 'cheque', 'especes', 'autre'],
    required: true
  },
  status: {
    type: String,
    enum: ['en_attente', 'confirmé', 'rejeté', 'remboursé'],
    default: 'en_attente'
  },
  reference:    { type: String, trim: true },   // Numéro de référence
  paymentDate:  { type: Date, required: true },
  confirmedAt:  { type: Date },
  confirmedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  period: {
    month:      { type: Number },   // 1-12
    year:       { type: Number },
  },
  notes:        { type: String },
  receiptUrl:   { type: String },   // Reçu PDF
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
