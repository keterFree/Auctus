const express = require('express');
const router = express.Router();
const Bid = require('../models/bid');
const Auction = require('../models/auction');
const authenticateToken = require('../middleware/auth');

// Place a bid
router.post('/bid', authenticateToken, async (req, res) => {
    const { item_id, bid_amount } = req.body;
    const user_id = req.user.id;

    try {
        const auction = await Auction.findById(item_id);
        if (!auction) {
            return res.status(404).json({ status: 'failure', message: 'Auction not found' });
        } else {

            if (bid_amount <= auction.currentBid) {
                return res.status(400).json({ status: 'failure', message: 'Bid amount must be higher than current bid' });
            } else {

                auction.currentBid = bid_amount;
                await auction.save();

                const bid = new Bid({
                    user_id,
                    auction_id: item_id,
                    bid_amount,
                    bid_time: new Date()
                });

                await bid.save();
                res.status(201).json({ status: 'success', bid });
            }
        }
    } catch (error) {
        res.status(400).json({ status: 'failure', error: error.message });
    }
});

// Get all bids for a specific auction
router.get('/bids/:auction_id', async (req, res) => {
    const auction_id = req.params.auction_id;
    try {
        const bids = await Bid.find({ auction_id: auction_id }).populate('user_id', 'username email');
        res.status(200).json({ status: 'success', bids });
    } catch (error) {
        res.status(400).json({ status: 'failure', error: error.message });
    }
});

module.exports = router;
