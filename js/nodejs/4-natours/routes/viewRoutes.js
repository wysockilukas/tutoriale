const express = require('express');

const router = express.Router();
const viewControler = require('../controllers/viewControler');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

//ten middleware wykosna sie pzred wsyztkimi poniezj i sprawdxa czy jest cookie z tokenem
//router.use(authController.isLoggedIn);

// To działa dlatgo ze u gory w app.js właczylismy  pug
// router.get('/', viewControler.root);
router.get('/', authController.isLoggedIn, viewControler.getOveriew);
// router.get('/tour/:slug', authController.protect, viewControler.getTour);
router.get('/tour/:slug', authController.isLoggedIn, viewControler.getTour);
router.get('/login', authController.isLoggedIn, viewControler.getLoginForm);
router.get('/me', authController.protect, viewControler.getAccount);
// router.get('/tour', viewControler.getTour);

router.get('/my-tours', bookingController.createBookingCheckout, authController.protect, viewControler.getMyTours);

router.post('/submit-user-data', authController.protect, viewControler.updateUserData);

module.exports = router;
