const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  meeting:    { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true },
  resolution: {
    title:       { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['ouverte', 'fermée', 'adoptée', 'rejetée'],
      default: 'ouverte'
    },
  },
  votes: [{
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    choix:     { type: String, enum: ['pour', 'contre', 'abstention'], required: true },
    votedAt:   { type: Date, default: Date.now },
    // Procuration
    procuration: { type: Boolean, default: false },
    procurationDe: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  results: {
    pour:       { type: Number, default: 0 },
    contre:     { type: Number, default: 0 },
    abstention: { type: Number, default: 0 },
    total:      { type: Number, default: 0 },
    resultat:   { type: String, enum: ['adoptée', 'rejetée', 'en_attente'], default: 'en_attente' },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  closedAt:  { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Vote', voteSchema);