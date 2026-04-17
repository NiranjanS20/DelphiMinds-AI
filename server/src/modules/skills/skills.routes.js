const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const skillsController = require('./skills.controller');

const router = express.Router();

router.get('/', authMiddleware, skillsController.getAllSkills);
router.get('/me', authMiddleware, skillsController.getMySkills);
router.post('/', authMiddleware, skillsController.addUserSkill);
router.patch('/:id', authMiddleware, skillsController.updateUserSkillLevel);

module.exports = router;
