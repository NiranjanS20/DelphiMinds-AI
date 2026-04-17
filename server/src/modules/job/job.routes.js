const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const jobController = require('./job.controller');

const router = express.Router();

router.get('/search', jobController.searchJobs);
router.get('/categories', jobController.getCategories);

router.get('/top-companies', authMiddleware, jobController.getTopCompanies);
router.get('/salary', authMiddleware, jobController.getSalaryHistogram);
router.get('/geodata', authMiddleware, jobController.getGeoSalaryData);
router.get('/history', authMiddleware, jobController.getHistoricalSalary);

module.exports = router;
