const express = require('express');
const router  = express.Router();

const authRoutes         = require('./auth');
const memberRoutes       = require('./members');
const meetingRoutes      = require('./meetings');
const paymentRoutes      = require('./payments');
const documentRoutes     = require('./documents');
const voteRoutes         = require('./votes');
const pvRoutes           = require('./pv');
const convocationRoutes  = require('./convocations');

router.use('/auth',         authRoutes);
router.use('/members',      memberRoutes);
router.use('/meetings',     meetingRoutes);
router.use('/payments',     paymentRoutes);
router.use('/documents',    documentRoutes);
router.use('/votes',        voteRoutes);
router.use('/pv',           pvRoutes);
router.use('/convocations', convocationRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API ACAFIS opérationnelle',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;