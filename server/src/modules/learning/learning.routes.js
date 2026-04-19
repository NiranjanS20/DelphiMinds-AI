const express = require('express');
const learningController = require('./learning.controller');

const router = express.Router();

router.post('/report', learningController.getDiagnosticReport); // Using POST conceptually to send user metrics, despite REST conventions allowing GET args
router.get('/report', learningController.getDiagnosticReport); // Provided per requirements

router.post('/path', learningController.generatePath);

module.exports = router;
