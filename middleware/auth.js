const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware to verify token
exports.authToken1 = async (req, res, next) => {
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

exports.authToken2 = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log(`Token:${authHeader}`);
  // if (!authHeader){
  //   return res.status(401).json({ status: 'failure', message: 'Access Denied: No token provided' });
  // }

  const token = authHeader.replace('Bearer ', '');
  // if(!token){
  //   return res.status(401).json({ status: 'failure', message: 'Access Denied: Token missing' });
  // } 
  console.log(`Token:${token}`);
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(verified.userId);
    console.log(`verified.id:${verified.userId}\n`);
    console.log(`id:${req.user}\n`);
    if (!req.user) {
      return res.status(401).json({ status: 'failure', message: 'Access Denied: User not found' });
    }
    next();
  } catch (err) {
    res.status(400).json({ status: 'failure', message: 'Invalid Token' });
  }
};
