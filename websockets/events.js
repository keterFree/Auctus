/**
 * 
 * Handlers for websockets events 
 */



// event: joinAuction
exports.joinAuction = (auctionId) => {
    socket.join(auctionId);
    console.log(`Client joined auction room: ${auctionId}`);
}

// event: placeBid
exports.placeBid = async (data) => {
    const { auctionId, bidAmount } = data;
    console.log(`Bid placed in room ${auctionId} at ${bidAmount}`);
    try {
        const auction = await Auction.findById(auctionId);
        const bidsList = await Bid.find({ auction_id: auctionId }).populate('user_id', 'username email');

        if (auction) {
            console.log(`Broadcasting to room ${auctionId} a bid of ${bidAmount}`);
            io.to(auctionId).emit('bidUpdate', {
                type: 'update_bids',
                item_id: auctionId,
                bids: auction.bidAmount,
                top_bid: auction.currentBid,
                bidsList: bidsList
            });
        }
    } catch (error) {
        console.error('Error placing bid:', error);
    }
}