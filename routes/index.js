const express = require('express');
const AppController = require('../controllers/AppController');
const AuthController = require('../controllers/AuthController');
const UsersContoller = require('../controllers/UsersController');
const FilesContoller = require('../controllers/FilesController');

const appRouter = express.Router();

appRouter.get('/status', AppController.getStatus);
appRouter.get('/stats', AppController.getStats);
appRouter.post('/users', UsersContoller.postNew);
appRouter.get('/connect', AuthController.getConnect);
appRouter.get('/disconnect', AuthController.getDisconnect);
appRouter.get('/users/me', AuthController.getMe);
appRouter.post('/files', FilesContoller.postUpload);

module.exports = appRouter;
