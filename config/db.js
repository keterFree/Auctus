require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection
exports.dbConnect = () => {
    mongoose.connect(process.env.MONGO_URI, {}).then(() => {
        console.log('Connected to MongoDB');
    }).catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    });
}