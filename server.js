const express = require('express');
const appRouter = require('./routes/index');

const port = process.env.PORT || 5000;
const app = express();

app.use('/', appRouter);

app.listen(port);
