const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  const ext = file.mimetype.split('/')[0];
  if (ext === 'image') {
    cb(null, true);
  } else {
    cb(new AppError('Not an image, zaladuj obrazki', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
}); //multer jest do uploadu plikow

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

//inne warianty tego na gorze
//upload.single('image')
//upload.array('images', 5)

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1 Cover image, params bo id jest w urlu
  const imageCoverFileName = `tour-${req.params.id}-${Date.now()}-cover.jpg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverFileName}`);
  req.body.imageCover = imageCoverFileName;

  // 2 pozostale pliki
  // w ciele map jest funkcja asynchrmoniczna, ktora zwraca promiese
  const imgFileNames = [];
  await Promise.all(
    req.files.images.map(async (file, idx) => {
      const imageFileName = `tour-${req.params.id}-${Date.now()}-${idx + 1}.jpg`;
      console.log(imageFileName);
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${imageFileName}`);
      imgFileNames.push(imageFileName);
    })
  );

  req.body.images = imgFileNames;
  // console.log(imgFileNames);
  next();

  /// UWAGA to mi nie dziallo
  // bo ten await był wewnatrz callback i kod sie nie zatrzymyalk ttlko wyukonywal siue next()
  // req.files.images.forEach(async (file, idx) => {
  //   const imageFileName = `tour-${req.params.id}-${Date.now()}-${idx}.jpg`;
  //   console.log(imageFileName);
  //   await sharp(file.buffer)
  //     .resize(2000, 1333)
  //     .toFormat('jpeg')
  //     .jpeg({ quality: 90 })
  //     .toFile(`public/img/tours/${imageFileName}`);
  //   imgFileNames.push(imageFileName);
  // });
});

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

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi
// https://docs.mongodb.com/manual/reference/operator/query/geoWithin/
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(new AppError('Please provide latitutr and longitude in the format lat,lng.', 400));
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(new AppError('Please provide latitutr and longitude in the format lat,lng.', 400));
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier, //bez tego odleglosc bedzie w metrach
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
