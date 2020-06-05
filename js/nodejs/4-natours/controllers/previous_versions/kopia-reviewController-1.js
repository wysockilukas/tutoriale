const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const Review = require('../../models/reviewModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const reviews = await Review.find(filter);
  res.status(200).json({
    status: 'success',
    data: {
      reviews,
    },
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new AppError(`cant find ${req.params.id}`, 404)); //wazny jest retutn bo jak go zaponialem to kod poszedl dalej; return wychoszi z fumkxji
  }

  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('brak tokenu, Zaloguj sie', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //dzięki trikowi na promisiffy odpalamy to asynchronicznie

  res.status(200).json({
    status: 'success',
    data: {
      reviews: review,
    },
    decoded,
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId; //jak w body jako parmatr posta nie bedzie tour id to bierzemy to z urla
  if (!req.body.user) req.body.user = req.user.id; //jak w body jako parmatr posta nie id user to bietrzemy ten co zwaca nam middleware protect

  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!review) {
    return next(new AppError(`cant find ${req.params.id}`, 404)); //wazny jest retutn bo jak go zaponialem to kod poszedl dalej; return wychoszi z fumkxji
  }
  res.status(201).json({
    status: 'success',
    data: {
      review: review,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    return next(new AppError(`cant find ${req.params.id}`, 404)); //wazny jest retutn bo jak go zaponialem to kod poszedl dalej; return wychoszi z fumkxji
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
