const { joinAuction, placeBid } = require('./events');

// handler for web sockets connections
exports.socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected');

        // events
        socket.on('joinAuction', joinAuction);
        socket.on('placeBid', placeBid);
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });
}