const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const salarySlipSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  basicSalary: {
    type: Number,
    required: true
  },
  allowances: {
    type: Number,
    required: true
  },
  deductions: {
    type: Number,
    required: true
  },
  netSalary: {
    type: Number,
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
});

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    employeeId: {
        type: String,
        required: true,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Offer Letter Fields
    jobTitle: {
        type: String,
        default: ''
    },
    startDate: {
        type: Date
    },
    expectedSalary: {
        type: Number,
        default: 0
    },
    offerLetterStatus: {
        type: String,
        enum: ['not_applied', 'pending', 'approved', 'rejected'],
        default: 'not_applied'
    },
    appliedDate: {
        type: Date
    },
    approvedDate: {
        type: Date
    },
    // salary: {
    //     basic: {
    //         type: Number,
    //         default: 0
    //     },
    //     hra: {
    //         type: Number,
    //         default: 0
    //     },
    //     allowances: {
    //         type: Number,
    //         default: 0
    //     },
    //     total: {
    //         type: Number,
    //         default: 0
    //     }
    // },
    offerLetterPdf: {
        type: String,
        default: ''
    },
    salarySlips: [salarySlipSchema]
}, { timestamps: true });

// Hash password before saving
employeeSchema.pre('save', async function(next) {
    try {
        if (!this.isModified('password')) {
            return next();
        }

        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to check password
employeeSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcryptjs.compare(candidatePassword, this.password);
};

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee; 