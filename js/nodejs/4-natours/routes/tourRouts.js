const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  middleWareAliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');

const router = express.Router(); // to jest middleware function

// router.route('/top-5-cheap').get((req, res) => {
//   getAllTours(req, res);
// });

router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/top-5-cheap').get(middleWareAliasTopTours, getAllTours); //robimy alias router , gdzie w middleware pzrekazemy domsylem paramery

router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
