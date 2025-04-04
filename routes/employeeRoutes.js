const express = require('express');
const router = express.Router();
const { 
    getEmployees, 
    addEmployee, 
    updateEmployee, 
    deleteEmployee,
    loginEmployee,
    applyForOfferLetter,
    submitSalarySlip,
    getEmployeeSalarySlips
} = require('../controllers/employeeController');
const { protectAdmin, protectEmployee } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', loginEmployee);

// Route to apply for an offer letter (protected by employee middleware)
router.post('/apply-offer-letter', protectEmployee, applyForOfferLetter);

// Salary slip routes
router.post('/salary-slip', protectEmployee, submitSalarySlip);
router.get('/salary-slips', protectEmployee, getEmployeeSalarySlips);

// Protected routes (admin only)
router.use(protectAdmin);
router.route('/')
    .get(getEmployees)
    .post(addEmployee);

router.route('/:id')
    .put(updateEmployee)
    .delete(deleteEmployee);

module.exports = router;