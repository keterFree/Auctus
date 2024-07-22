const express = require('express');
const router = express.Router();
const { authToken1 } = require('../middleware/auth');
const { getUserInfo } = require('../controllers/users');

// Get logged-in user's info
router.get('/me', authToken1, getUserInfo);

module.exports = router;
