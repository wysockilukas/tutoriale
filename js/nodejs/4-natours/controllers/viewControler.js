const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOveriew = catchAsync(async (req, res) => {
  // 1 pobranie danych z APi z kolekcji
  const tours = await Tour.find({});

  // 2 Zbuduj template

  // 3 Render ten template na podstaiw danych z API

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLogin = catchAsync(async (req, res) => {
  res.status(200).render('login');
});
