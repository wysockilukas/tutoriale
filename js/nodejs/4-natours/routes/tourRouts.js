const express = require('express');
const tourControler = require('../controllers/tourController');
const authControler = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRouts');

const router = express.Router(); // to jest middleware function

// router.route('/top-5-cheap').get((req, res) => {
//   getAllTours(req, res);
// });

router.route('/tour-stats').get(tourControler.getTourStats);
router
  .route(authControler.protect, authControler.restrictTo('admin', 'lead-guide', 'guide'), '/monthly-plan/:year')
  .get(tourControler.getMonthlyPlan);
router.route('/top-5-cheap').get(tourControler.middleWareAliasTopTours, tourControler.getAllTours); //robimy alias router , gdzie w middleware pzrekazemy domsylem paramery

router
  .route('/')
  .get(tourControler.getAllTours)
  .post(authControler.protect, authControler.restrictTo('admin', 'lead-guide'), tourControler.createTour);

router
  .route('/:id')
  .get(tourControler.getTour)
  .patch(authControler.protect, authControler.restrictTo('admin', 'lead-guide'), tourControler.updateTour)
  .delete(authControler.protect, authControler.restrictTo('admin', 'lead-guide'), tourControler.deleteTour);

/*  
// to jest nested route 
// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews
router
  .route('/:tourId/reviews')
  .post(authControler.protect, authControler.restrictTo('user'), reviewController.createReview);
*/

// to jest trik na neste route, gdy siceza jest taka to uzywamy innego routa
// router to tez middlewar
// a to sie nazywa mouting route
router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
