const express = require('express');
const fs = require('fs');
const app = express();
// const bodyParser = require('body-parser');

// express.json() to jakaś funkcja ktora jest middleware
// bez tego nie widac req.body w poscie
app.use(express.json());
// app.use(bodyParser.json());

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8'));

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

app.get('/api/v1/tours/:id', (req, res) => {
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
});

app.post('/api/v1/tours', (req, res) => {
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
});

app.patch('/api/v1/tours/:id', (req, res) => {
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
});

app.delete('/api/v1/tours/:id', (req, res) => {
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
});

const port = 3000;
app.listen(port, () => {
  console.log('Serwer pracuje na porcie ', port);
});
