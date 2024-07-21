const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// User registration endpoint
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const user = new User({ username, password, email });
        await user.save();
        res.status(201).json({ status: 'success', message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ status: 'failure', message: 'Internal server error' });
    }
});

// User login endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ status: 'failure', message: 'User not found' });
        }
        
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ status: 'failure', message: 'Invalid password' });
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ status: 'success', token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ status: 'failure', message: 'Internal server error' });
    }
});

// Middleware to verify token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ status: 'failure', message: 'Access Denied: No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ status: 'failure', message: 'Access Denied: Token missing' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(verified.userId);
        if (!req.user) {
            return res.status(401).json({ status: 'failure', message: 'Access Denied: User not found' });
        }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ status: 'failure', message: 'Token has expired' });
        }
        console.error('Token verification error:', err);
        res.status(400).json({ status: 'failure', message: 'Invalid Token' });
    }
};

// Get logged-in user's info
router.get('/me', authenticateToken, async (req, res) => {
    res.json({ status: 'success', user: req.user });
});

module.exports = { router, authenticateToken };
