const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text:   { type: String, required: true, trim: true },
  author: { type: String, trim: true },
  date:   { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  phase:       { type: String, trim: true },   // ex: "Ndianda - Construction", "Finance", "Juridique"
  status: {
    type: String,
    enum: ['a_faire', 'en_cours', 'termine', 'bloque'],
    default: 'a_faire',
  },
  responsible: { type: String, trim: true },
  dueDate:     { type: Date },
  notes:       [noteSchema],
  order:       { type: Number, default: 0 },
  isArchived:  { type: Boolean, default: false },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Task', taskSchema);
