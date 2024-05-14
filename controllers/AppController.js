const express = require('express');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

const app = express();
const AppController = {
  getStatus: app.get('/status', (req, res) => {
    if (redisClient.isAlive() && dbClient.isAlive()) {
      res.status = 200;
      res.send({ redis: true, db: true });
    } else {
      res.send({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
    }
  }),
  getStats: app.get('/stats', async (req, res) => {
    res.status = 200;
    res.send({ users: await dbClient.nbUsers(), files: await dbClient.nbFiles() });
  }),
};

module.exports = AppController;
