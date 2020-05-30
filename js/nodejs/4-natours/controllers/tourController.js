const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.middleWareAliasTopTours = (req, res, next) => {
  // nadpisuje parametry
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// https://docs.mongodb.com/manual/reference/sql-aggregation-comparison/
// https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gt: 1 } } },
    {
      $group: {
        // _id: null,
        // _id: '$difficulty',
        _id: { $toUpper: '$difficulty' },
        numRatings: { $sum: '$ratingsQuantity' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgRating: { $avg: '$ratingsAverage' },
        numTours: { $sum: 1 },
      },
    },
    { $sort: { numTours: -1 } },
    // { $match: { _id: { $ne: 'EASY' } } },
  ]);

  // const execQuery = await statQuery;
  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        // _id: { month: { $month: '$startDates' }, year: { $year: '$startDates' } },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: {
          $arrayElemAt: [
            ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            '$_id',
          ],
        },
        month_id: '$_id',
      },
    },
    { $sort: { numTourStarts: -1 } },
    {
      $project: {
        _id: 0,
      },
    },
    { $limit: 12 },
  ]);

  // const execQuery = await statQuery;
  res.status(200).json({
    results: plan.length,
    status: 'success',
    data: plan,
  });
});
