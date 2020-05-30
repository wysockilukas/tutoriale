const express = require('express');
const reviewController = require('../controllers/reviewController');
const authControler = require('../controllers/authController');

// to merge params sprawia ze jak mamy nested route to mamy dostep do pierwszego roura - jesgo parametrow
const router = express.Router({ mergeParams: true }); // to jest middleware function

router
  .route('/')
  .get(authControler.protect, reviewController.getAllReviews)
  .post(
    authControler.protect,
    authControler.restrictTo('user'),
    reviewController.nestedTourId,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(authControler.protect, authControler.restrictTo('admin', 'lead-guide'), reviewController.deleteReview);

module.exports = router;
