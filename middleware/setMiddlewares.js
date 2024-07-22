const express = require('express');
const bodyParser = require('body-parser');
const {logger } = require('./logger');

exports.setMiddleware = (app) => {
    app.use(bodyParser.json());
    app.use(express.static('public'));
    app.use(logger);
}