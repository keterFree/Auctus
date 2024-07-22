require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { dbConnect } = require('./config/db');
const { errHandler } = require('./config/errors');
const { setRoutes } = require('./routes/setRoutes');
const { setMiddleware } = require('./middleware/setMiddlewares');
const { socketHandler } = require('./websockets/sockets');


// Check for required environment variables
if (!process.env.MONGO_URI) {
    console.error('Missing required environment variable: MONGO_URI');
    process.exit(1);
}

if (!process.env.PORT) {
    console.error('Missing required environment variable: PORT');
    process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Middleware
setMiddleware(app);

// Routes
setRoutes(app);

// MongoDB connection
dbConnect();

// Socket.io connection
socketHandler(io);

// Error handling middleware
errHandler(app);

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