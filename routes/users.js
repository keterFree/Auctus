const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// User registration endpoint
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    const user = new User({ username, password, email });
    await user.save();
    res.json({ status: 'success' });
});

// User login endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user) {
        const isValidPassword = await user.comparePassword(password);
        if (isValidPassword) {
            const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ status: 'success', token });
        } else {
            res.json({ status: 'failure', message: 'Invalid password' });
        }
    } else {
        res.json({ status: 'failure', message: 'No such user' });
    }
});

// Middleware to verify token
// const authenticateToken = (req, res, next) => {
//     const token = req.headers['authorization'];
//     if (!token) return res.sendStatus(403);
//     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//         if (err) return res.sendStatus(403);
//         req.user = user;
//         next();
//     });
// };

const authenticateToken = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    console.log(`Token:${authHeader}`);
    //   if (!authHeader) return res.status(401).json({ status: 'failure', message: 'Access Denied: No token provided' });

    const token = authHeader.replace('Bearer ', '');
    //   if (!token) return res.status(401).json({ status: 'failure', message: 'Access Denied: Token missing' });
    console.log(`Token:${token}`);
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(verified.userId);
        console.log(`verifiec.id:${verified.userId}`);
        console.log(`id:${req.user}`);
        if (!req.user) {
            return res.status(401).json({ status: 'failure', message: 'Access Denied: User not found' });
        }
        next();
    } catch (err) {
        res.status(400).json({ status: 'failure', message: 'Invalid Token' });
    }
};

module.exports = { router, authenticateToken };
