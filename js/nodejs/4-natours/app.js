const express = require('express');

const app = express();
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControler');

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

// to jest serwer static file
app.use(express.static(`${__dirname}/public`));

// Tworrzymy własne funkcje middlewae
// app.use((req, res, next) => {
//   console.log('Z middeware');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter); // to sie nazywa mouting router
app.use('/api/v1/users', userRouter);

// Dodajemy tu miiddleWare, a to działa tak ze jak spelniones routingi powyzej to do tego dolnego nie dojdziemy
// obłusga 404
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `cant find ${req.originalUrl}`,
  // });
  // const err = new Error('cos jest nie tak');
  // err.statusCode = 404;
  // err.status = 'fail';
  // next(err); //jak przekazmy cokolwiek jako argument do next to razu pomijmy wszystkie inne middle ware i idzuemy do ostarnuuego
  next(new AppError(`cant find ${req.originalUrl}`, 404));
});

//to jest ostatni miileware i dostaje jako argyment erro - jest do oblugi beldow
app.use(globalErrorHandler);

module.exports = app;
