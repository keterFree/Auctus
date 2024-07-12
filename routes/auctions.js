// const express = require('express');
// const router = express.Router();
// const Auction = require('../models/auction');
// const multer = require('multer');
// const authenticateToken = require('../middleware/auth');

// // Set up multer for file uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/uploads/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname);
//     }
// });

// const upload = multer({ storage: storage });

// // Create a new auction with picture upload
// router.post('/addAuction', authenticateToken, upload.single('picture'), async (req, res) => {
//     const { itemName, description, startingBid, bidEndTime } = req.body;
//     const picture = req.file ? req.file.path : null;

//     // Validate input fields
//     if (!itemName || !description || !startingBid || !bidEndTime) {
//         return res.status(400).json({ status: 'failure', message: 'All fields are required' });
//     }

//     const auction = new Auction({
//         itemName: itemName,
//         description: description,
//         startingBid: startingBid,
//         owner: req.user._id,
//         bidEndTime: bidEndTime,
//         picture: picture,
//     });

//     try {
//         await auction.save();
//         res.status(201).json({ status: 'success', auction });
//     } catch (error) {
//         console.error('Error saving auction:', error);
//         res.status(500).json({ status: 'failure', message: 'Internal server error' });
//     }
// });

// // Get all auctions
// router.get('/', async (req, res) => {
//     try {
//         const auctions = await Auction.find().populate('owner', 'username email');
//         res.status(200).json({ status: 'success', auctions });
//     } catch (error) {
//         console.error('Error fetching auctions:', error);
//         res.status(500).json({ status: 'failure', message: 'Internal server error' });
//     }
// });

// // Get auction by ID
// router.get('/:id', async (req, res) => {
//     try {
//         const auction = await Auction.findById(req.params.id).populate('owner', 'username email');
//         if (!auction) {
//             return res.status(404).json({ status: 'failure', message: 'Auction not found' });
//         }
//         res.status(200).json({ status: 'success', auction });
//     } catch (error) {
//         console.error('Error fetching auction:', error);
//         res.status(500).json({ status: 'failure', message: 'Internal server error' });
//     }
// });

// // Error handling for Multer file uploads
// router.use((err, req, res, next) => {
//     if (err instanceof multer.MulterError) {
//         // Handle Multer-specific errors
//         console.error('Multer error:', err);
//         res.status(400).json({ status: 'failure', message: err.message });
//     } else if (err) {
//         // Handle other errors
//         console.error('Error:', err);
//         res.status(400).json({ status: 'failure', message: err.message });
//     } else {
//         next();
//     }
// });

// module.exports = router;
