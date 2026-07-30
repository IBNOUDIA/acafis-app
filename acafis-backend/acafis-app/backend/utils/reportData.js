const Payment = require('../models/Payment');
const Member  = require('../models/Member');
const Expense = require('../models/Expense');
const bhs     = require('../config/bhs');

// Rassemble toutes les données nécessaires au rapport financier
// (utilisé à la fois par l'endpoint résumé et par les générateurs PDF/Word).
async function gatherReportData() {
  const paymentStats = await Payment.aggregate([
    { $match: { status: 'confirmé' } },
    { $group: {
      _id: null,
      totalCollecte: { $sum: '$amount' },
      nombrePaiements: { $sum: 1 },
    } },
  ]);

  const memberStats = await Member.aggregate([
    { $group: {
      _id: null,
      total: { $sum: 1 },
      aJour: { $sum: { $cond: [{ $eq: ['$financial.status', 'à_jour'] }, 1, 0] } },
      retardMineur: { $sum: { $cond: [{ $eq: ['$financial.status', 'retard_mineur'] }, 1, 0] } },
      retardMajeur: { $sum: { $cond: [{ $eq: ['$financial.status', 'retard_majeur'] }, 1, 0] } },
      totalAttendu: { $sum: '$financial.totalAmount' },
    } },
  ]);

  const expenseStats = await Expense.aggregate([
    { $group: { _id: '$commission', total: { $sum: '$amount' } } },
  ]);
  const parCommission = { habitat: 0, finance: 0, communication: 0, juridique: 0 };
  expenseStats.forEach(e => { parCommission[e._id] = e.total; });

  return {
    bhs,
    recettes: {
      totalCollecte: paymentStats[0]?.totalCollecte || 0,
      nombrePaiements: paymentStats[0]?.nombrePaiements || 0,
    },
    depensesParCommission: parCommission,
    totalDepenses: Object.values(parCommission).reduce((a, b) => a + b, 0),
    membres: {
      total: memberStats[0]?.total || 0,
      aJour: memberStats[0]?.aJour || 0,
      retardMineur: memberStats[0]?.retardMineur || 0,
      retardMajeur: memberStats[0]?.retardMajeur || 0,
      totalAttendu: memberStats[0]?.totalAttendu || 0,
    },
  };
}

module.exports = { gatherReportData };