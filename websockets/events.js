/**
 * 
 * Handlers for websockets events 
 */

const Auction = require('../models/auction');
const Bid = require('../models/bid');


// event: joinAuction
exports.joinAuction = (socket, auctionId) => {
    socket.join(auctionId);
    console.log(`Client joined auction room: ${auctionId}`);
}

// event: placeBid
exports.placeBid = async (io, data) => {
    const { auctionId, bidAmount } = data;
    console.log(`placed $${bidAmount} bid in room ${auctionId}`);
    try {
        const auction = await Auction.findById(auctionId);
        const bidsList = await Bid.find({ auction_id: auctionId }).populate('user_id', 'username email');

        if (!auction){
            console.log('could not find bid ', auctionId);
            return;
        }

        console.log(`Broadcasting to room ${auctionId} a $${bidAmount} bid`);
        io.to(auctionId).emit('bidUpdate', {
            type: 'update_bids',
            item_id: auctionId,
            bids: auction.bidAmount,
            top_bid: auction.currentBid,
            bidsList: bidsList
        });
    } catch (error) {
        console.error('Error placing bid:', error);
    }
}