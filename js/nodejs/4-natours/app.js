const express = require('express');

const app = express();
const morgan = require('morgan');

const tourRouter = require('./routes/tourRouts');
const userRouter = require('./routes/userRouts');

// const bodyParser = require('body-parser');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// express.json() to jakaś funkcja ktora jest middleware
// bez tego nie widac req.body w poscie
app.use(express.json());
// app.use(bodyParser.json());

app.use(express.static(`${__dirname}/public`));

// Tworrzymy własne funkcje middlewae
app.use((req, res, next) => {
  console.log('Z middeware');
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter); // to sie nazywa mouting router
app.use('/api/v1/users', userRouter);

module.exports = app;
