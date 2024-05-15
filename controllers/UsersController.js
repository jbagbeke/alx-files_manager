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
      res.status = 400;
      res.send({ error: 'Missing email' });
    } else if (!password) {
      res.status = 400;
      res.send({ error: 'Missing password' });
    }

    if (dbClient.isAlive()) {
      if (await dbClient.keyExists(email)) {
        res.status = 400;
        res.send({ error: 'Already exist' });
      } else {
        res.status = 201;
        const userObj = await dbClient.insertDocument({ email, password });
        res.send(userObj);
      }
    }
  }),
};

module.exports = UsersContoller;
