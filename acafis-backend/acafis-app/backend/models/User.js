const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName:    { type: String, required: true, trim: true },
  lastName:     { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:     { type: String, required: true, minlength: 8, select: false },
  phone:        { type: String, trim: true },
  avatar:       { type: String, default: '' },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'admin_finance', 'membre_ca', 'acquereur', 'liaison_sn', 'observateur'],
    default: 'acquereur'
  },
  position:     { type: String, trim: true }, // Président, VP, SG...
  isActive:     { type: Boolean, default: true },
  lastLogin:    { type: Date },
  language:     { type: String, enum: ['fr', 'en', 'wo'], default: 'fr' },
  refreshToken: { type: String, select: false },
  resetPasswordToken:   { type: String, select: false },
  resetPasswordExpire:  { type: Date, select: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual : nom complet
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password avant sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Vérifier password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
