const express = require('express');
const router = express.Router();
const {
    home, explore, item,
    bid, register, login
} = require('../controllers/views');


// GET: routes
router.get('/home', home);
router.get('/explore', explore);
router.get('/item', item);
router.get('/bid', bid);
router.get('/register', register);
router.get('/login', login);

module.exports = router;