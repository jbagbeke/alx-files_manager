const express = require('express');
const AppController = require('../controllers/AppController');

const appRouter = express.Router();

appRouter.get('/status', AppController.getStatus);
appRouter.get('/stats', AppController.getStats);

module.exports = appRouter;
