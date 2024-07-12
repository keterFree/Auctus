const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    description: { type: String, required: true },
    startingBid: { type: Number, required: true },
    currentBid: { type: Number, default: 0 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bidEndTime: { type: Date, required: true },
    picture: { type: String, required: false }  // Add picture field
});

// Check if the model exists before defining it
const Auction = mongoose.models.Auction || mongoose.model('Auction', auctionSchema);

module.exports = mongoose.model('Auction', auctionSchema);
