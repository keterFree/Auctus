const express = require('express');
const router = express.Router();
const { authToken2 } = require('../middleware/auth');
const { placeBid, getBids } = require('../controllers/bids');

// Get all bids for a specific auction
router.get('/bids/:auction_id', getBids);

// Place a bid
router.post('/bid', authToken2, placeBid);

module.exports = router;
