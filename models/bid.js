const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    auction_id: mongoose.Schema.Types.ObjectId,
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bid_amount: Number,
    bid_time: Date
});

module.exports = mongoose.model('Bid', bidSchema);
