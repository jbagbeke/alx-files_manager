const express = require('express');
const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');
const { ObjectId } = require('mongodb');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

const app = express();

const AuthController = {
  getConnect: app.get('/connect', async (req, res) => {
    let authHeader = 'authorization' in req.headers ? req.headers.authorization : false;

    if (authHeader && authHeader.length >= 2) {
      authHeader = authHeader.split(' ');
      const credentials = Buffer.from(authHeader[1], 'base64').toString('utf8').split(':');

      if (credentials && credentials.length >= 2) {
        const email = credentials[0];
        const password = credentials[1];

        if (dbClient.isAlive()) {
          const user = await dbClient.findUser({ email, password: sha1(password) });

          if (user) {
            const token = uuidv4();

            await redisClient.set(`auth_${token}`, user._id, 86400);
            res.status(200).json({ token });
            res.end();
            return;
          }
        }
      }
    }
    res.status(401).json({ error: 'Unauthorized' });
    res.end();
  }),
  getDisconnect: app.get('/disconnect', async (req, res) => {
    const token = 'x-token' in req.headers ? req.headers['x-token'] : false;

    if (token) {
      const userId = await redisClient.get(`auth_${token}`);
      if (userId) {
        const user = dbClient.findUser({ _id: ObjectId(userId) });

        if (user) {
          await redisClient.del(`auth_${token}`);
          res.status(204).end();
          return;
        }
      }
    }
    res.status(401).json({ error: 'Unauthorized' });
    res.end();
  }),
  getMe: app.get('/users/me', async (req, res) => {
    const token = 'x-token' in req.headers ? req.headers['x-token'] : false;

    if (token) {
      const userId = await redisClient.get(`auth_${token}`);
      if (userId) {
        const user = await dbClient.findUser({ _id: ObjectId(userId) });
        if (user) {
          res.json({ id: user._id, email: user.email });
          res.end();
          return;
        }
      }
    }
    res.status(401).json({ error: 'Unauthorized' });
    res.end();
  }),
};

module.exports = AuthController;
