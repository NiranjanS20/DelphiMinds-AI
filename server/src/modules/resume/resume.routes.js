const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const { uploadResume } = require('../../middleware/upload.middleware');
const resumeController = require('./resume.controller');

const router = express.Router();

router.post('/upload', authMiddleware, uploadResume.single('resume'), resumeController.uploadResume);
router.get('/:id', authMiddleware, resumeController.getResume);

module.exports = router;
