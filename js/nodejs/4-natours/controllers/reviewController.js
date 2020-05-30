const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

//  middleware ktory modyfikue po drodze bodu zapytania gdy jest to jest nested route
exports.nestedTourId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId; //jak w body jako parmatr posta nie bedzie tour id to bierzemy to z urla
  if (!req.body.user) req.body.user = req.user.id; //jak w body jako parmatr posta nie id user to bietrzemy ten co zwaca nam middleware protect
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.createReview = factory.createOne(Review);

/*
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
*/
