const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const atsController = require('./ats.controller');

const router = express.Router();

router.post('/analyze', authMiddleware, atsController.analyze);

module.exports = router;
