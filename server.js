require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const logger = require('./middleware/logger');
const { router: userRoutes, authenticateToken } = require('./routes/users');
const Auction = require('./models/auction'); // Assuming you have an Auction model
const multer = require('multer');
const bidRoutes = require('./routes/bids');
// const authenticateToken = require('./middleware/auth');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(logger);

// Check for required environment variables
if (!process.env.MONGO_URI) {
    console.error('Missing required environment variable: MONGO_URI');
    process.exit(1);
}

if (!process.env.PORT) {
    console.error('Missing required environment variable: PORT');
    process.exit(1);
}

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
});

// Routes
app.use('/api/users', userRoutes);
// app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/explore', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'explore.html'));
});

app.get('/item', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'item.html'));
});

app.get('/bid', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bid.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinAuction', (auctionId) => {
        socket.join(auctionId);
        console.log(`Client joined auction room: ${auctionId}`);
    });

    socket.on('placeBid', async (data) => {
        const { auctionId, bidAmount } = data;
        console.log(`Bid placed in room ${auctionId} at ${bidAmount}`);
        try {
            const auction = await Auction.findById(auctionId);
            if (auction) {
                // auction.bids.push({ amount: bidAmount, userId: socket.id });
                // auction.currentBid = Math.max(auction.currentBid, bidAmount);
                // await auction.save();

                console.log(`Broadcasting to room ${auctionId} a bid of ${bidAmount}`);
                io.to(auctionId).emit('bidUpdate', {
                    type: 'update_bids',
                    item_id: auctionId,
                    bids: auction.bidAmount,
                    top_bid: auction.currentBid,
                });
            }
        } catch (error) {
            console.error('Error placing bid:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Auction routes
// Create a new auction with picture upload
app.post('/api/auctions/addAuction', authenticateToken, upload.single('picture'), async (req, res) => {
    const { itemName, description, startingBid, bidEndTime } = req.body;
    const picture = req.file ? req.file.path : null;

    // Validate input fields
    if (!itemName || !description || !startingBid || !bidEndTime) {
        return res.status(400).json({ status: 'failure', message: 'All fields are required' });
    }

    const auction = new Auction({
        itemName: itemName,
        description: description,
        startingBid: startingBid,
        owner: req.user._id,
        bidEndTime: bidEndTime,
        picture: picture,
    });

    try {
        await auction.save();
        res.status(201).json({ status: 'success', auction });
    } catch (error) {
        console.error('Error saving auction:', error);
        res.status(500).json({ status: 'failure', message: 'Internal server error' });
    }
});

// Get all auctions
app.get('/api/auctions/', async (req, res) => {
    try {
        const auctions = await Auction.find().populate('owner', 'username email');
        res.status(200).json({ status: 'success', auctions });
    } catch (error) {
        console.error('Error fetching auctions:', error);
        res.status(500).json({ status: 'failure', message: 'Internal server error' });
    }
});

// Get auction by ID
app.get('/api/auctions/:id', async (req, res) => {
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
});

// Error handling for Multer file uploads
app.use('/api/auctions', (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Handle Multer-specific errors
        console.error('Multer error:', err);
        res.status(400).json({ status: 'failure', message: err.message });
    } else if (err) {
        // Handle other errors
        console.error('Error:', err);
        res.status(400).json({ status: 'failure', message: err.message });
    } else {
        next();
    }
});

// General error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ status: 'failure', message: 'Internal server error' });
});

// Start server
server.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${process.env.PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Perform cleanup and exit process
    process.exit(1);
});

module.exports = io;
