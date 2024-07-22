const path = require('node:path');

// home page
exports.home = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
}

// hexplore page
exports.explore = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/explore.html'));
}

// item page
exports.item = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/item.html'));
}

// bid page
exports.bid = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/bid.html'));
}

// login page
exports.login = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
}

// register page
exports.register = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
}