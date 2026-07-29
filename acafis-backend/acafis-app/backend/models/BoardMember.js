const mongoose = require('mongoose');

const boardMemberSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },

  role: {
    type: String,
    enum: [
      'president', 'vice_president', 'secretaire_general', 'secretaire_adjoint',
      'tresoriere', 'tresorier_adjoint', 'administrateur',
    ],
    required: true,
  },

  commissions: [{
    type: String,
    enum: ['habitat', 'finance', 'communication', 'juridique'],
  }],

  email:       { type: String, trim: true, lowercase: true },
  phone:       { type: String },
  linkedinUrl: { type: String, trim: true },
  photoUrl:    { type: String },

  order:  { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, {
  timestamps: true,
});

boardMemberSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});
boardMemberSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('BoardMember', boardMemberSchema);