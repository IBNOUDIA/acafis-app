const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { chat } = require('../controllers/assistantController');

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Trop de messages envoyés, réessayez dans 15 minutes' },
});

router.post('/chat', chatLimiter, chat);

module.exports = router;
