const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  memberNumber: { type: String, required: true, unique: true }, // ACQ-001 à ACQ-048
  firstName:    { type: String, required: true, trim: true },
  lastName:     { type: String, required: true, trim: true },
  email:        { type: String, required: true, lowercase: true },
  phone:        { type: String },
  whatsapp:     { type: String },
  address: {
    street:   { type: String },
    city:     { type: String },
    province: { type: String },
    country:  { type: String, default: 'Canada' },
  },
  // Informations logement
  lot: {
    number:   { type: String },           // Ex: V-023 (Villa), A-105 (Appartement)
    type:     { type: String, enum: ['villa_F3', 'villa_F4', 'villa_F5', 'villa_F6', 'appartement'], },
    surface:  { type: Number },           // m²
    price:    { type: Number },           // Prix en FCFA
  },
  // Statut financier
  financial: {
    totalAmount:  { type: Number, default: 0 },   // Montant total dû
    paidAmount:   { type: Number, default: 0 },   // Montant payé
    balance:      { type: Number, default: 0 },   // Solde restant
    status: {
      type: String,
      enum: ['à_jour', 'retard_mineur', 'retard_majeur', 'suspendu'],
      default: 'à_jour'
    },
    lastPaymentDate: { type: Date },
  },
  status: {
    type: String,
    enum: ['actif', 'inactif', 'suspendu', 'désisté'],
    default: 'actif'
  },
  joinDate:     { type: Date, default: Date.now },
  notes:        { type: String },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual : nom complet
memberSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Calculer solde automatiquement
memberSchema.pre('save', function (next) {
  this.financial.balance = this.financial.totalAmount - this.financial.paidAmount;
  next();
});

module.exports = mongoose.model('Member', memberSchema);
