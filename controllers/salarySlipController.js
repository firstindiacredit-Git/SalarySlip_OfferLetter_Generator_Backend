const SalarySlip = require('../model/SalarySlip');
const Employee = require('../model/Employee');

// Create new salary slip
exports.createSalarySlip = async (req, res) => {
    try {
        const {
            employeeName,
            employeeId,
            designation,
            department,
            month,
            year,
            basicSalary,
            hra,
            allowances,
            deductions,
            netSalary
        } = req.body;

        console.log('Received salary slip data:', req.body); // Debug log

        // Validate required fields
        const requiredFields = ['employeeName', 'employeeId', 'designation', 'department', 'month', 'year', 'basicSalary'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate numeric fields
        if (isNaN(basicSalary) || basicSalary <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Basic salary must be a positive number'
            });
        }

        // Check if employee exists
        const employee = await Employee.findOne({ employeeId });
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Create salary slip
        const salarySlip = new SalarySlip({
            employeeName,
            employeeId,
            designation,
            department,
            month,
            year: parseInt(year),
            basicSalary: parseFloat(basicSalary),
            hra: parseFloat(hra) || 0,
            allowances: parseFloat(allowances) || 0,
            deductions: parseFloat(deductions) || 0,
            netSalary: parseFloat(netSalary)
        });

        await salarySlip.save();

        res.status(201).json({
            success: true,
            message: 'Salary slip created successfully',
            data: salarySlip
        });

    } catch (error) {
        console.error('Error creating salary slip:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating salary slip',
            error: error.message
        });
    }
};

// Get all salary slips
exports.getAllSalarySlips = async (req, res) => {
    try {
        const salarySlips = await SalarySlip.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: salarySlips
        });

    } catch (error) {
        console.error('Error fetching salary slips:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching salary slips',
            error: error.message
        });
    }
};

// Get salary slips by employee ID
exports.getSalarySlipsByEmployeeId = async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        // Check if the requesting user is the owner of the salary slip or an admin
        if (!req.user.isAdmin && req.user.employeeId !== employeeId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this salary slip'
            });
        }

        const salarySlips = await SalarySlip.find({ employeeId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: salarySlips
        });

    } catch (error) {
        console.error('Error fetching salary slips:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching salary slips',
            error: error.message
        });
    }
};
