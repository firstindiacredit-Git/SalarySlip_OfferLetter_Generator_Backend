const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, getAdminProfile } = require('../controllers/adminController');
const { registerEmployee, loginEmployee, getEmployeeProfile, updateEmployeeProfile } = require('../controllers/employeeController');
const { protectAdmin, protectEmployee } = require('../middleware/authMiddleware');

// Admin Routes
router.post('/admin/register', registerAdmin);
router.post('/admin/login', loginAdmin);
router.get('/admin/profile', protectAdmin, getAdminProfile);

// Employee Routes
router.post('/employee/register', registerEmployee);
router.post('/employee/login', loginEmployee);
router.get('/employee/profile', protectEmployee, getEmployeeProfile);
router.put('/employee/profile', protectEmployee, updateEmployeeProfile);

module.exports = router; 