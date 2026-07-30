const mongoose = require('mongoose');
const fees = require('../config/fees');

const paymentSchema = new mongoose.Schema({
  member:       { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  amount:       { type: Number, required: true },
  currency:     { type: String, default: 'CAD' },
  type: {
    type: String,
    enum: ['part_social', 'cotisation', 'acompte', 'solde', 'frais_admin', 'autre'],
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

// Recalcule le montant payé, le solde et le statut d'un membre à partir de
// ses paiements CONFIRMÉS uniquement. À appeler après création/confirmation/
// modification/suppression d'un paiement pour garder le module "État membres" à jour.
paymentSchema.statics.recalculerMembre = async function (memberId) {
  const Member = mongoose.model('Member');

  const result = await this.aggregate([
    { $match: { member: new mongoose.Types.ObjectId(memberId), status: 'confirmé' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const paidAmount = result[0]?.total || 0;

  const member = await Member.findById(memberId);
  if (!member) return null;

  member.financial.paidAmount = paidAmount;
  member.financial.balance = member.financial.totalAmount - paidAmount;
  member.financial.partSocialPaye = paidAmount >= fees.PART_SOCIAL;

  if (member.financial.balance <= 0) {
    member.financial.status = 'à_jour';
  } else if (paidAmount > 0) {
    member.financial.status = 'retard_mineur';
  } else {
    member.financial.status = 'retard_majeur';
  }
  if (paidAmount > 0) member.financial.lastPaymentDate = new Date();

  await member.save();
  return member;
};

module.exports = mongoose.model('Payment', paymentSchema);