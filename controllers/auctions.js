require('dotenv').config();
const Auction = require('../models/auction'); // Assuming you have an Auction model
const axios = require('axios');
const FormData = require('form-data');

// add auction
exports.addAuction = async (req, res) => {
    const { itemName, description, startingBid, bidEndTime } = req.body;
    const picture = req.file;

    // Validate input fields
    if (!itemName || !description || !startingBid || !bidEndTime) {
        return res.status(400).json({
            status: 'failure',
            message: 'All fields are required'
        });
    }

    let pictureUrl = null;
    if (picture) {
        try {
            const formData = new FormData();
            formData.append('key', process.env.API_KEY);
            formData.append('image', picture.buffer.toString('base64'));

            // Upload image to ImgBB
            const imgResponse = await axios.post('https://api.imgbb.com/1/upload', formData, {
                headers: formData.getHeaders(),
            });

            pictureUrl = imgResponse.data.data.url;
            console.log(pictureUrl);
        } catch (error) {
            console.error('Error uploading image to ImgBB:', error);
            return res.status(500).json({ status: 'failure', message: 'Image upload failed' });
        }
    }

    const auction = new Auction({
        itemName,
        description,
        startingBid,
        owner: req.user._id,
        bidEndTime,
        picture: pictureUrl,
    });

    try {
        await auction.save();
        res.status(201).json({ status: 'success', auction });
    } catch (error) {
        console.error('Error saving auction:', error);
        res.status(500).json({ status: 'failure', message: 'Internal server error' });
    }
}

// Update auction bidEndTime
exports.updateAuction = async (req, res) => {
    const { bidEndTime } = req.body;

    if (!bidEndTime) {
        return res.status(400).json({ status: 'failure', message: 'bidEndTime is required' });
    }

    try {
        const auction = await Auction.findById(req.params.id);

        if (!auction) {
            return res.status(404).json({ status: 'failure', message: 'Auction not found' });
        }

        if (auction.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ status: 'failure', message: 'Unauthorized' });
        }

        auction.bidEndTime = bidEndTime;
        await auction.save();

        res.status(200).json({ status: 'success', auction });
    } catch (error) {
        console.error('Error updating bidEndTime:', error);
        res.status(500).json({ status: 'failure', message: 'Internal server error' });
    }
}

// Get all auctions
exports.getAllAuctions = async (req, res) => {
    try {
        const auctions = await Auction.find().populate('owner', 'username email');
        res.status(200).json({ status: 'success', auctions });
    } catch (error) {
        console.error('Error fetching auctions:', error);
        res.status(500).json({ status: 'failure', message: 'Internal server error' });
    }
}

// Get auction by ID
exports.getAuction = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id).populate('owner', 'username email');
        if (!auction) {
            return res.status(404).json({ status: 'failure', message: 'Auction not found' });
        }
        res.status(200).json({ status: 'success', auction });
    } catch (error) {
        console.error('Error fetching auction:', error);
        res.status(500).json({ status: 'failure', message: 'Internal server error' });
    }
}

// Delete auction
exports.deleteAuction = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id);

        if (!auction) {
            return res.status(404).json({ status: 'failure', message: 'Auction not found' });
        }

        if (auction.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ status: 'failure', message: 'Unauthorized' });
        }

        await Auction.deleteOne({ _id: req.params.id });
        res.status(200).json({ status: 'success', message: 'Auction deleted successfully' });
    } catch (error) {
        console.error('Error deleting auction:', error);
        res.status(500).json({ status: 'failure', message: 'Internal server error' });
    }
}