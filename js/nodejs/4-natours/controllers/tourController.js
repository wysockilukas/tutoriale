const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.middleWareAliasTopTours = (req, res, next) => {
  // const newReq = {
  //   ...req.query,
  //   limit: 5,
  //   sort: '-ratingsAverage,price',
  // };
  // req.query = newReq;

  // nadpisuje parametry
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
  const tours = await features.query; // to uruchamia zapytanie

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // const tour = tours.find((el) => el.id === +req.params.id);
  const tour = await Tour.findById(req.params.id);
  //to samo co Tour.find({_id: req.params.id});
  if (!tour) {
    return next(new AppError(`cant find ${req.params.id}`, 404)); //wazny jest retutn bo jak go zaponialem to kod poszedl dalej; return wychoszi z fumkxji
  }
  res.status(200).json({
    status: 'success',
    data: {
      tours: tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError(`cant find ${req.params.id}`, 404)); //wazny jest retutn bo jak go zaponialem to kod poszedl dalej; return wychoszi z fumkxji
  }
  res.status(201).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError(`cant find ${req.params.id}`, 404)); //wazny jest retutn bo jak go zaponialem to kod poszedl dalej; return wychoszi z fumkxji
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

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
          $arrayElemAt: [['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], '$_id'],
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
