const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  commission: {
    type: String,
    enum: ['habitat', 'finance', 'communication', 'juridique'],
    required: true,
  },
  description: { type: String, required: true, trim: true },
  amount:      { type: Number, required: true },
  currency:    { type: String, default: 'FCFA' },
  date:        { type: Date, required: true },
  category:    { type: String, trim: true },
  receiptUrl:  { type: String },
  notes:       { type: String },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Expense', expenseSchema);