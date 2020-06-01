const express = require('express');
const reviewController = require('../controllers/reviewController');
const authControler = require('../controllers/authController');

// to merge params sprawia ze jak mamy nested route to mamy dostep do pierwszego roura - jesgo parametrow
const router = express.Router({ mergeParams: true }); // to jest middleware function

router.use(authControler.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(authControler.restrictTo('user'), reviewController.nestedTourId, reviewController.createReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authControler.restrictTo('admin', 'user'), reviewController.updateReview)
  .delete(authControler.restrictTo('admin', 'user'), reviewController.deleteReview);

module.exports = router;
