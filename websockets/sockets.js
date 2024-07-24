const { joinAuction, placeBid } = require('./events');

// handler for web sockets connections
exports.socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected');

        // events
        socket.on('joinAuction', (auctionId) => {
            joinAuction(socket, auctionId);
        });

        socket.on('placeBid', (data) => {
            placeBid(io, data);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });
}