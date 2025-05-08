const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const offerLetterRoutes = require('./routes/offerLetterRoutes');
const salarySlipRoutes = require('./routes/salarySlipRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'https://salary-slip-offer-letter-generator-frontend.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Pre-flight requests
app.options('*', cors());

app.use(express.json());

// Connect to MongoDB with improved options
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000, // Timeout after 30 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    connectTimeoutMS: 30000, // Connection attempt timeout
    heartbeatFrequencyMS: 10000, // 10 seconds between heartbeats
    retryWrites: true,
    w: 'majority'
})
.then(() => console.log('Connected to MongoDB successfully'))
.catch((err) => {
    console.error('MongoDB connection error:', err);
    // Don't exit the process, let the server run anyway
    console.log('Server will continue running, but database operations may fail');
});

// Add connection error handler
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error after initial connection:', err);
});

// Add connection success handler after reconnect
mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnection successful');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/offer-letter', offerLetterRoutes);
app.use('/api/salary-slips', salarySlipRoutes);
app.get("/", (req, res) => {
    res.send("welcome to salary slip backend ");
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
