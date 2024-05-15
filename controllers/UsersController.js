const express = require('express');
const dbClient = require('../utils/db');

const app = express();
app.use(express.json());

const UsersContoller = {
  postNew: app.post('/users', async (req, res) => { /* eslint consistent-return: 0 */
    const requestBody = req.body;

    const email = 'email' in requestBody ? requestBody.email : false;
    const password = 'password' in requestBody ? requestBody.password : false;

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      res.end();
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      res.end();
      return;
    }

    if (dbClient.isAlive()) {
      if (await dbClient.findUser({ email })) {
        res.status(400).json({ error: 'Already exist' });
        res.end();
      } else {
        const userObj = await dbClient.insertUser({ email, password });
        res.status(201).json(userObj);
        res.end();
      }
    }
  }),
};

module.exports = UsersContoller;
