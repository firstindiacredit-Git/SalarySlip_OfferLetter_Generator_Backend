const Admin = require('../model/Admin');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Debug route to check admin existence
exports.checkAdmin = async (req, res) => {
    try {
        const { email } = req.query;
        const admin = await Admin.findOne({ email });
        res.json({ exists: !!admin });
    } catch (error) {
        console.error('Error checking admin:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Register Admin
exports.registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if admin already exists
        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        // Create admin
        const admin = await Admin.create({
            name,
            email,
            password,
            isAdmin: true
        });

        if (admin) {
            res.status(201).json({
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                isAdmin: admin.isAdmin,
                token: generateToken(admin._id)
            });
        }
    } catch (error) {
        console.error('Error in registerAdmin:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Login Admin
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        console.log('Login attempt for email:', email); // Debug log

        // Find admin
        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.log('Admin not found for email:', email); // Debug log
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await Admin.findOne({ password });
        console.log('Password match result:', isMatch); // Debug log

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token
        const token = generateToken(admin._id);

        res.json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            isAdmin: admin.isAdmin,
            token
        });
    } catch (error) {
        console.error('Error in loginAdmin:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Admin Profile
exports.getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id).select('-password');
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json(admin);
    } catch (error) {
        console.error('Error in getAdminProfile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}; 