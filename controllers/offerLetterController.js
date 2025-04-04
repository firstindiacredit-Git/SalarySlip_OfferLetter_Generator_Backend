const OfferLetter = require('../model/OfferLetter');
const Employee = require('../model/Employee');

// Create Offer Letter
const createOfferLetter = async (req, res) => {
    try {
        const {
            employeeId,
            name,
            email,
            position,
            startDate,
            salary,
            hiringManager,
            managerTitle,
            message
        } = req.body;

        // Check if employee exists
        const employee = await Employee.findOne({ employeeId });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Create offer letter
        const offerLetter = await OfferLetter.create({
            employeeId,
            name,
            email,
            position,
            startDate,
            salary,
            hiringManager,
            managerTitle,
            message,
            generatedDate: new Date()
        });

        res.status(201).json({
            success: true,
            data: offerLetter,
            message: 'Offer letter created successfully'
        });
    } catch (error) {
        console.error('Error in createOfferLetter:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to create offer letter', 
            error: error.message 
        });
    }
};

// Get Offer Letter by Employee ID
const getOfferLetterByEmployeeId = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const offerLetter = await OfferLetter.findOne({ employeeId }).sort({ createdAt: -1 });
        
        if (!offerLetter) {
            return res.status(404).json({ 
                success: false,
                message: 'No offer letter found for this employee' 
            });
        }

        res.json({
            success: true,
            data: offerLetter
        });
    } catch (error) {
        console.error('Error in getOfferLetterByEmployeeId:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch offer letter', 
            error: error.message 
        });
    }
};

// Get All Offer Letters
const getAllOfferLetters = async (req, res) => {
    try {
        const offerLetters = await OfferLetter.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: offerLetters
        });
    } catch (error) {
        console.error('Error in getAllOfferLetters:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch offer letters', 
            error: error.message 
        });
    }
};

// Update Offer Letter Status
const updateOfferLetterStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const offerLetter = await OfferLetter.findById(id);
        if (!offerLetter) {
            return res.status(404).json({ 
                success: false,
                message: 'Offer letter not found' 
            });
        }

        offerLetter.status = status;
        await offerLetter.save();

        res.json({
            success: true,
            data: offerLetter,
            message: 'Offer letter status updated successfully'
        });
    } catch (error) {
        console.error('Error in updateOfferLetterStatus:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to update offer letter status', 
            error: error.message 
        });
    }
};

module.exports = {
    createOfferLetter,
    getOfferLetterByEmployeeId,
    getAllOfferLetters,
    updateOfferLetterStatus
};
