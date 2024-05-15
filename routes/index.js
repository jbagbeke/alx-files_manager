const express = require('express');
const AppController = require('../controllers/AppController');
const UsersContoller = require('../controllers/UsersController');

const appRouter = express.Router();

appRouter.get('/status', AppController.getStatus);
appRouter.get('/stats', AppController.getStats);
appRouter.post('/users', UsersContoller.postNew);

module.exports = appRouter;
