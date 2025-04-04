const mongoose = require('mongoose');

const offerLetterSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        ref: 'Employee'
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    salary: {
        type: Number,
        required: true
    },
    hiringManager: {
        type: String,
        required: true
    },
    managerTitle: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    generatedDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const OfferLetter = mongoose.model('OfferLetter', offerLetterSchema);
module.exports = OfferLetter;
