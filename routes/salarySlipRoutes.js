const express = require('express');
const router = express.Router();
const { 
    createSalarySlip,
    getAllSalarySlips,
    getSalarySlipsByEmployeeId
} = require('../controllers/salarySlipController');
const { protect, protectAdmin } = require('../middleware/authMiddleware');

// Admin routes
router.post('/', protectAdmin, createSalarySlip);
router.get('/', protectAdmin, getAllSalarySlips);

// Employee routes - change this to use 'protect' instead of 'protectAdmin'
router.get('/employee/:employeeId', protect, getSalarySlipsByEmployeeId);

module.exports = router;
