const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControler');

const tourRouter = require('./routes/tourRouts');
const userRouter = require('./routes/userRouts');
const reviewRouter = require('./routes/reviewRouts');
const viewRouter = require('./routes/viewRoutes');

const app = express();
app.set('view engine', 'pug'); //wsjazujemy expressowi ktory template engine bedzie w uzyciu, ale musimy go zainstalowac
app.set('views', path.join(__dirname, 'views'));
// const bodyParser = require('body-parser');

// to jest serwer static file
app.use(express.static(`${__dirname}/public`));

//  GLOBAL MIDDLEWARE
// Security http headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Za duzo prob z tewgo IP sporobuj pownoenie za godzine',
});
app.use('/api', limiter); //wszystkie rout o początku api bedę limitowane

// express.json() to jakaś funkcja ktora jest middleware
// bez tego nie widac req.body w poscie
app.use(
  express.json({
    limit: '10kb', //ograniczamy limit do 10kb
  })
);
// app.use(bodyParser.json());

app.use(cookieParser());

// Data sanitization przed NoSQL querry injetion
app.use(mongoSanitize());

// Data sanitization against xss
app.use(xss());

// Zapobiega parametr polluttion
app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'],
  })
);

// Tworrzymy własne funkcje middlewae
// app.use((req, res, next) => {
//   console.log('Z middeware');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// to sie nazywa mouting router
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter); // to sie nazywa mouting router
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

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
