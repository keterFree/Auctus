const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    auction_id: mongoose.Schema.Types.ObjectId,
    user_id: mongoose.Schema.Types.ObjectId,
    bid_amount: Number,
    bid_time: Date
});

module.exports = mongoose.model('Bid', bidSchema);
