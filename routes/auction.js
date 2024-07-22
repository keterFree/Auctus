const express = require('express');
const router = express.Router();
const { authToken1 } = require('../middleware/auth');
const { upload } = require('../middleware/multer');
const {
    addAuction, updateAuction, getAllAuctions,
    getAuction, deleteAuction
} = require('../controllers/auctions');

router.post('/addAuction', authToken1, upload.single('picture'), addAuction);

// Update auction bidEndTime
router.patch('/:id/bidEndTime', authToken1, updateAuction);

// Get all auctions
router.get('/', getAllAuctions);

// Get auction by ID
router.get('/:id', getAuction);

// Delete auction
router.delete('/:id', authToken1, deleteAuction);

module.exports = router;