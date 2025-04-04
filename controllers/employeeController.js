const Employee = require('../model/Employee');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Register Employee
const registerEmployee = async (req, res) => {
    try {
        const { name, email, password, department, employeeId, phoneNumber, address } = req.body;

        // Check if employee already exists
        const employeeExists = await Employee.findOne({ 
            $or: [{ email }, { employeeId }] 
        });
        
        if (employeeExists) {
            return res.status(400).json({ message: 'Employee already exists' });
        }

        // Create employee
        const employee = await Employee.create({
            name,
            email,
            password,
            department,
            employeeId,
            phoneNumber: phoneNumber || '',
            address: address || '',
            joiningDate: new Date(),
            role: 'employee'
        });

        if (employee) {
            res.status(201).json({
                _id: employee._id,
                name: employee.name,
                email: employee.email,
                department: employee.department,
                employeeId: employee.employeeId,
                phoneNumber: employee.phoneNumber,
                address: employee.address,
                joiningDate: employee.joiningDate,
                role: employee.role,
                token: generateToken(employee._id)
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Login Employee
const loginEmployee = async (req, res) => {
    try {
        const { email, password } = req.body;
        const employee = await Employee.findOne({ email });

        if (!employee) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await employee.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: employee._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        res.json({
            _id: employee._id,
            name: employee.name,
            email: employee.email,
            department: employee.department,
            employeeId: employee.employeeId,
            token
        });
    } catch (error) {
        console.error('Error in loginEmployee:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

// Get Employee Profile
const getEmployeeProfile = async (req, res) => {
    try {
        const employee = await Employee.findById(req.employee._id).select('-password');
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update Employee Profile
const updateEmployeeProfile = async (req, res) => {
    try {
        const employee = await Employee.findById(req.employee._id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        employee.name = req.body.name || employee.name;
        employee.email = req.body.email || employee.email;
        employee.phoneNumber = req.body.phoneNumber || employee.phoneNumber;
        employee.address = req.body.address || employee.address;
        if (req.body.password) {
            employee.password = req.body.password;
        }
        employee.department = req.body.department || employee.department;

        const updatedEmployee = await employee.save();
        res.json({
            _id: updatedEmployee._id,
            name: updatedEmployee.name,
            email: updatedEmployee.email,
            department: updatedEmployee.department,
            employeeId: updatedEmployee.employeeId,
            phoneNumber: updatedEmployee.phoneNumber,
            address: updatedEmployee.address,
            joiningDate: updatedEmployee.joiningDate,
            lastLogin: updatedEmployee.lastLogin,
            role: updatedEmployee.role,
            token: generateToken(updatedEmployee._id)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all employees
const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().select('-password');
        res.json(employees);
    } catch (error) {
        console.error('Error in getEmployees:', error);
        res.status(500).json({ message: 'Failed to fetch employees', error: error.message });
    }
};

// Add new employee
const addEmployee = async (req, res) => {
    try {
        const { name, email, password, department, employeeId } = req.body;

        const employeeExists = await Employee.findOne({ 
            $or: [{ email }, { employeeId }] 
        });
        
        if (employeeExists) {
            return res.status(400).json({ message: 'Employee already exists' });
        }

        const employee = await Employee.create({
            name,
            email,
            password,
            department,
            employeeId
        });

        res.status(201).json({
            _id: employee._id,
            name: employee.name,
            email: employee.email,
            department: employee.department,
            employeeId: employee.employeeId
        });
    } catch (error) {
        console.error('Error in addEmployee:', error);
        res.status(500).json({ message: 'Failed to add employee', error: error.message });
    }
};

// Update employee
const updateEmployee = async (req, res) => {
    try {
        const { name, email, department } = req.body;
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        if (email !== employee.email) {
            const emailExists = await Employee.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        employee.name = name || employee.name;
        employee.email = email || employee.email;
        employee.department = department || employee.department;

        const updatedEmployee = await employee.save();
        res.json({
            _id: updatedEmployee._id,
            name: updatedEmployee.name,
            email: updatedEmployee.email,
            department: updatedEmployee.department,
            employeeId: updatedEmployee.employeeId
        });
    } catch (error) {
        console.error('Error in updateEmployee:', error);
        res.status(500).json({ message: 'Failed to update employee', error: error.message });
    }
};

// Delete employee
const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        await employee.deleteOne();
        res.json({ message: 'Employee removed successfully' });
    } catch (error) {
        console.error('Error in deleteEmployee:', error);
        res.status(500).json({ message: 'Failed to delete employee', error: error.message });
    }
};

// Apply for Offer Letter
const applyForOfferLetter = async (req, res) => {
    try {
        const { jobTitle, startDate, salary } = req.body;
        const employeeId = req.employee._id;

        if (!jobTitle || !startDate || !salary) {
            return res.status(400).json({
                message: 'Job title, start date, and expected salary are required'
            });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        employee.jobTitle = jobTitle;
        employee.startDate = new Date(startDate);
        employee.expectedSalary = Number(salary);
        employee.offerLetterStatus = 'pending';
        employee.appliedDate = new Date();
        
        employee.salary = {
            basic: Number(salary) * 0.5,
            hra: Number(salary) * 0.2,
            allowances: Number(salary) * 0.3,
            total: Number(salary)
        };

        await employee.save();

        res.status(200).json({
            message: 'Offer letter application submitted successfully',
            data: {
                jobTitle: employee.jobTitle,
                startDate: employee.startDate,
                expectedSalary: employee.expectedSalary,
                offerLetterStatus: employee.offerLetterStatus,
                appliedDate: employee.appliedDate
            }
        });
    } catch (error) {
        console.error('Error in applyForOfferLetter:', error);
        res.status(500).json({
            message: 'Failed to submit offer letter application',
            error: error.message
        });
    }
};

// Update Offer Letter Status
const updateOfferLetterStatus = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Must be pending, approved, or rejected'
            });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        employee.offerLetterStatus = status;
        if (status === 'approved') {
            employee.approvedDate = new Date();
        }

        await employee.save();

        res.json({
            message: 'Offer letter status updated successfully',
            data: {
                employeeId: employee._id,
                status: employee.offerLetterStatus,
                approvedDate: employee.approvedDate
            }
        });
    } catch (error) {
        console.error('Error in updateOfferLetterStatus:', error);
        res.status(500).json({
            message: 'Failed to update offer letter status',
            error: error.message
        });
    }
};

// Get Employee by ID
const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id).select('-password');
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        console.error('Error in getEmployeeById:', error);
        res.status(500).json({ message: 'Failed to fetch employee', error: error.message });
    }
};

// Submit salary slip
const submitSalarySlip = async (req, res) => {
    try {
        const { month, year, basicSalary, allowances, deductions, netSalary } = req.body;
        const employee = await Employee.findById(req.employee._id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Add new salary slip to employee's salarySlips array
        employee.salarySlips.push({
            month,
            year: parseInt(year),
            basicSalary: parseFloat(basicSalary),
            allowances: parseFloat(allowances),
            deductions: parseFloat(deductions),
            netSalary: parseFloat(netSalary),
            generatedDate: new Date()
        });

        await employee.save();

        res.status(201).json({
            success: true,
            message: 'Salary slip submitted successfully',
            data: employee.salarySlips[employee.salarySlips.length - 1]
        });
    } catch (error) {
        console.error('Error in submitSalarySlip:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to submit salary slip', 
            error: error.message 
        });
    }
};

// Get employee salary slips
const getEmployeeSalarySlips = async (req, res) => {
    try {
        const employee = await Employee.findById(req.employee._id);
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json({
            success: true,
            data: employee.salarySlips
        });
    } catch (error) {
        console.error('Error in getEmployeeSalarySlips:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch salary slips', 
            error: error.message 
        });
    }
};

module.exports = {
    registerEmployee,
    loginEmployee,
    getEmployeeProfile,
    updateEmployeeProfile,
    getEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    applyForOfferLetter,
    updateOfferLetterStatus,
    getEmployeeById,
    submitSalarySlip,
    getEmployeeSalarySlips
};