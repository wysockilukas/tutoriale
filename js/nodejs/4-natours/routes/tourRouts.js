const express = require('express');
const tourController = require('../controllers/tourController');
const authControler = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRouts');

const router = express.Router(); // to jest middleware function

// router.route('/top-5-cheap').get((req, res) => {
//   getAllTours(req, res);
// });

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route(authControler.protect, authControler.restrictTo('admin', 'lead-guide', 'guide'), '/monthly-plan/:year')
  .get(tourController.getMonthlyPlan);
router.route('/top-5-cheap').get(tourController.middleWareAliasTopTours, tourController.getAllTours); //robimy alias router , gdzie w middleware pzrekazemy domsylem paramery

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(authControler.protect, authControler.restrictTo('admin', 'lead-guide'), tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authControler.protect, authControler.restrictTo('admin', 'lead-guide'), tourController.updateTour)
  .delete(authControler.protect, authControler.restrictTo('admin', 'lead-guide'), tourController.deleteTour);

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
