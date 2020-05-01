const express = require('express');

const fs = require('fs');

const app = express();
const morgan = require('morgan');
// const bodyParser = require('body-parser');

app.use(morgan('dev'));

// express.json() to jakaś funkcja ktora jest middleware
// bez tego nie widac req.body w poscie
app.use(express.json());
// app.use(bodyParser.json());

// Tworrzymy włąsne funkcje middlewae
app.use((req, res, next) => {
  console.log('Z middeware');
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8'));

const getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};

const getTour = (req, res) => {
  if (+req.params.id > tours.length) {
    return res.status(404).json({
      status: 'fail',
    });
  }
  const tour = tours.find((el) => el.id === +req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
};

const createTour = (req, res) => {
  // res.status(200).json({ Post: 'ok', Cos: 1 });
  const newID = tours[tours.length - 1].id + 1;

  /*
  const newTour = {
    id: newID,
    ...req.body,
  };
  */
  const newTour = Object.assign({ id: newID }, req.body);
  tours.push(newTour);
  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
    console.log('err');
  });
  // console.log(newTour);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
};

const updateTour = (req, res) => {
  const tour = tours.find((el) => el.id === +req.params.id);
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
    });
  }
  const newTour = {
    ...tour,
    ...req.body,
  };
  res.status(200).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
};

const deleteTour = (req, res) => {
  const idx = tours.findIndex((el) => el.id === +req.params.id);
  if (idx < 0) {
    return res.status(404).json({
      status: 'fail',
    });
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'w budowie',
  });
};
const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'w budowie',
  });
};
const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'w budowie',
  });
};
const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'w budowie',
  });
};
const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'w budowie',
  });
};

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
const tourRouter = express.Router(); // to jest middleware function
const userRouter = express.Router();

tourRouter.route('/').get(getAllTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

app.use('/api/v1/tours', tourRouter); // to sie nazywa mouting router
app.use('/api/v1/users', userRouter);

const port = 3000;
app.listen(port, () => {
  console.log('Serwer pracuje na porcie ', port);
});
