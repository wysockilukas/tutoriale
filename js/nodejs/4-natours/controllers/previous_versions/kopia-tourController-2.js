const Tour = require('../../models/tourModel');
const APIFeatures = require('../../utils/apiFeatures');

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

exports.getAllTours = async (req, res) => {
  try {
    // 1A) Budujemy zapytanie
    // let queryObj = { ...req.query };
    // const excludedFileds = ['page', 'sort', 'limit', 'fields'];
    // excludedFileds.forEach((el) => delete queryObj[el]);

    // // 1B) Zaawansowane filtrowanie
    // const queryStr = JSON.stringify(queryObj).replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    // queryObj = JSON.parse(queryStr);
    // // console.log(req.query, queryObj);

    // let query = Tour.find(queryObj); //to zwraca query, ale jak jest z await to od razy wykonuje to zapytanie i wtedy nie mozna ztobic np sort lub limit

    // 2 Sortowanie
    // if (req.query.sort) {
    //   query = query.sort(req.query.sort.split(',').join(' '));
    // } else {
    //   query = query.sort('-createdAt');
    // }

    // 3 Fields limit
    // if (req.query.fields) {
    //   query = query.select(req.query.fields.split(',').join(' '));
    // } else {
    //   query = query.select('-__v');
    // }

    // // 4 Pagination
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    // query = query.skip(skip).limit(limit);

    // // if (req.query.page) {
    // //   const numTours = await Tour.countDocuments();
    // //   if (skip >= numTours) throw new Error('Nie ma takiej strony'); // i kod przejdzie do cache error
    // // }

    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments(query);
    //   if (numTours === 0) throw new Error('This page does not exist'); //i kod przejdzie do cache error
    // }

    //execute querry
    // Tworzymy obiekt features i pzrekaujemy do konstruktora pusty query
    // Jak wywołamy metode filter to qury otrzymuja docelowa postac
    const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
    const tours = await features.query; // to uruchamia zapytanie

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours: tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.getTour = async (req, res) => {
  // const tour = tours.find((el) => el.id === +req.params.id);
  try {
    const tour = await Tour.findById(req.params.id);
    //to samo co Tour.find({_id: req.params.id});
    res.status(200).json({
      status: 'success',
      data: {
        tours: tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(201).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};
// https://docs.mongodb.com/manual/reference/sql-aggregation-comparison/
// https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/
exports.getTourStats = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
      // {
      //   $group: {
      //     _id: 'month',
      //     field1: {
      //       $sum: 1,
      //     },
      //   },
      // },
      // {
      //   $sort: {
      //     field1: -1,
      //   },
      // },
    ]);

    // const execQuery = await statQuery;
    res.status(200).json({
      results: plan.length,
      status: 'success',
      data: plan,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};
