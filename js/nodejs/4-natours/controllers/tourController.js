const fs = require('fs');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8'));

// To jest param middleware
exports.checkId = (req, res, next, val) => {
  const idx = tours.findIndex((el) => el.id === +val);
  if (idx < 0) {
    return res.status(404).json({
      status: 'dupa',
    });
  }
  next();
};

// To jest  middleware
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'zle w body',
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};

exports.getTour = (req, res) => {
  const tour = tours.find((el) => el.id === +req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
};

exports.createTour = (req, res) => {
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

exports.updateTour = (req, res) => {
  const tour = tours.find((el) => el.id === +req.params.id);
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

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
