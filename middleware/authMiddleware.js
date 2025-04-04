const jwt = require('jsonwebtoken');
const Admin = require('../model/Admin');
const Employee = require('../model/Employee');

// Protect routes - for both admin and regular employees
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log("Token received:", token); // Debugging line

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded); // Debugging line

      // Try to find user in both Admin and Employee models
      let user = await Admin.findById(decoded.id).select('-password');
      
      if (!user) {
        user = await Employee.findById(decoded.id).select('-password');
      }

      if (!user) {
        console.log("User not found"); // Debugging line
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Token verification failed:", error); // Debugging line
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    console.log("No token provided"); // Debugging line
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Protect admin routes - only for admins
const protectAdmin = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get admin from token
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json({ message: 'Not authorized as admin' });
    }

    // Check if user is admin
    if (!admin.isAdmin) {
      return res.status(403).json({ message: 'Not authorized as an admin' });
    }

    req.user = admin;
    next();
  } catch (error) {
    console.error("Admin verification failed:", error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Protect Employee Routes
const protectEmployee = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get employee from token
        const employee = await Employee.findById(decoded.id).select('-password');
        if (!employee) {
            return res.status(401).json({ message: 'Not authorized as employee' });
        }

        // Check if employee is active
        if (!employee.isActive) {
            return res.status(401).json({ message: 'Account is deactivated' });
        }

        req.employee = employee;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = { protect, protectAdmin, protectEmployee }; 