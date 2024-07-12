// const Auction = require('../models/Auction'); // Import the Auction model

// module.exports = async (req, res, next) => {
//     try {
//         const auction = await Auction.findById(req.params.id).populate('owner', 'username email');
//         if (!auction) {
//             return res.status(404).json({ status: 'failure', message: 'Auction not found' });
//         }
//         req.auction = auction; // Attach the auction to the request object
//         next();
//     } catch (error) {
//         console.error('Error fetching auction:', error);
//         res.status(500).json({ status: 'failure', message: 'Internal server error' });
//     }
// };
