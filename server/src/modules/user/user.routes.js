const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const userController = require('./user.controller');

const router = express.Router();

router.get('/profile', authMiddleware, userController.getProfile);
router.post('/profile', authMiddleware, userController.syncProfile);
router.post('/update', authMiddleware, userController.updateProfile);

module.exports = router;
