const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const learningController = require('./learning.controller');

const router = express.Router();

// Routes are mounted under /learning in routes/index.js
router.post('/report', authMiddleware, learningController.getDiagnosticReport);
router.post('/path', authMiddleware, learningController.generatePath);

module.exports = router;
