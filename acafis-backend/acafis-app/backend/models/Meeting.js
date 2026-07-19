const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['ca_ordinaire', 'ca_extraordinaire', 'ag_ordinaire', 'ag_extraordinaire', 'commission'],
    required: true
  },
  date:         { type: Date, required: true },
  time:         { type: String, required: true }, // ex: "14:00"
  duration:     { type: Number, default: 120 },   // minutes
  platform:     { type: String, default: 'Jitsi Meet' },
  meetingUrl:   { type: String },                  // Lien Jitsi
  location:     { type: String },                  // Si présentiel
  status: {
    type: String,
    enum: ['planifiée', 'en_cours', 'terminée', 'annulée', 'reportée'],
    default: 'planifiée'
  },
  // Ordre du jour
  agenda: [{
    order:       { type: Number },
    title:       { type: String, required: true },
    description: { type: String },
    duration:    { type: Number }, // minutes
    presenter:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  // Présences
  attendees: [{
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status:    { type: String, enum: ['présent', 'absent', 'excusé'], default: 'présent' },
    joinedAt:  { type: Date },
    leftAt:    { type: Date },
  }],
  // Votes / résolutions
  resolutions: [{
    title:       { type: String, required: true },
    description: { type: String },
    votesFor:    { type: Number, default: 0 },
    votesAgainst:{ type: Number, default: 0 },
    abstentions: { type: Number, default: 0 },
    result:      { type: String, enum: ['adoptée', 'rejetée', 'reportée'] },
  }],
  // Procès-verbal
  minutes: {
    content:     { type: String },          // Texte PV
    fileUrl:     { type: String },          // PDF PV
    approvedAt:  { type: Date },
    approvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  convocationSent: { type: Boolean, default: false },
  convocationDate: { type: Date },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  commission:   { type: String, enum: ['habitat', 'finance', 'communication', 'juridique'] },
}, {
  timestamps: true
});

module.exports = mongoose.model('Meeting', meetingSchema);
