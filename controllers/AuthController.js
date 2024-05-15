const express = require('express');
const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');
const { ObjectId } = require('mongodb');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

const app = express();

const AuthController = {
  getConnect: app.get('/connect', async (req, res) => {
    const authorization = 'authorization' in req.headers ? req.headers.authorization : false;
    if (authorization) {
      const credentials = Buffer.from(authorization.split(' ')[1], 'base64').toString('utf-8').split(':');

      if (credentials.length >= 2) {
        const email = credentials[0];
        const password = credentials[1];

        if (dbClient.isAlive()) {
          const userId = await dbClient.findUser({ email, password: sha1(password) });

          if (userId) {
            const uuidToken = uuidv4();
            await redisClient.set(`auth_${uuidToken}`, userId._id, 86400);
            res.status(200).json({ token: uuidToken });
            res.end();
          } else {
            res.status(401).json({ error: 'Unautorized' });
            res.end();
          }
        }
      }
    }
  }),
  getDisconnect: app.get('/disconnect', async (req, res) => {
    const userToken = 'x-token' in req.headers ? req.headers['x-token'] : false;

    if (userToken) {
      const userId = await redisClient.get(`auth_${userToken}`);

      if (userId) {
        await redisClient.del(`auth_${userToken}`);
        res.status = 204;
        res.send('');
        return;
      }
    }
    res.status(401).json({ error: 'Unauthorized' });
    res.end();
  }),
  getMe: app.get('/users/me', async (req, res) => {
    const userToken = 'x-token' in req.headers ? req.headers['x-token'] : false;
    if (userToken) {
      const userId = await redisClient.get(`auth_${userToken}`);
      if (userId) {
        const userObj = await dbClient.findUser({ _id: ObjectId(userId) });

        if (userObj) {
          res.json({ email: userObj.email, id: userId });
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
