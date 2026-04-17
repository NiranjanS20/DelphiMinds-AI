const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const { strictAiLimiter } = require('../../middleware/rateLimiter');
const chatbotController = require('./chatbot.controller');

const router = express.Router();

router.post('/chat', strictAiLimiter, authMiddleware, chatbotController.chat);

module.exports = router;
