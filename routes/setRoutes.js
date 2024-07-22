const auth = require('./auth');
const bids = require('./bids');
const users = require('./users');
const views = require('./views');
const auctions = require('./auction');

exports.setRoutes = (app) => {
    app.use('/api/users', auth);
    app.use('/api/bids', bids);
    app.use('/api/users', users);
    app.use('/', views);
    app.use('/api/auctions', auctions);
}