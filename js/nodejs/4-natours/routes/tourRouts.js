const express = require('express');
const tourControler = require('../controllers/tourController');
const authControler = require('../controllers/authController');

const router = express.Router(); // to jest middleware function

// router.route('/top-5-cheap').get((req, res) => {
//   getAllTours(req, res);
// });

router.route('/tour-stats').get(tourControler.getTourStats);
router.route('/monthly-plan/:year').get(tourControler.getMonthlyPlan);
router.route('/top-5-cheap').get(tourControler.middleWareAliasTopTours, tourControler.getAllTours); //robimy alias router , gdzie w middleware pzrekazemy domsylem paramery

router.route('/').get(authControler.protect, tourControler.getAllTours).post(tourControler.createTour);

router
  .route('/:id')
  .get(tourControler.getTour)
  .patch(tourControler.updateTour)
  .delete(authControler.protect, authControler.restrictTo('admin', 'lead-guide'), tourControler.deleteTour);

module.exports = router;
