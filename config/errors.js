require('dotenv').config();
const multer = require('multer');

exports.errHandler = (app) => {
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
}