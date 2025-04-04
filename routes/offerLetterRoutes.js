const express = require('express');
const router = express.Router();
const { 
    createOfferLetter, 
    getOfferLetterByEmployeeId, 
    getAllOfferLetters, 
    updateOfferLetterStatus 
} = require('../controllers/offerLetterController');
const { protectAdmin, protectEmployee } = require('../middleware/authMiddleware');

// Admin routes
router.post('/create', protectAdmin, createOfferLetter);
router.get('/all', protectAdmin, getAllOfferLetters);
router.put('/:id/status', protectAdmin, updateOfferLetterStatus);

// Employee routes
router.get('/:employeeId', protectEmployee, getOfferLetterByEmployeeId);

module.exports = router;
