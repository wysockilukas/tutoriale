const express = require('express');

const router = express.Router();
const viewControler = require('../controllers/viewControler');

// To działa dlatgo ze u gory w app.js właczylismy  pug
// router.get('/', viewControler.root);
router.get('/', viewControler.getOveriew);
router.get('/tour/:slug', viewControler.getTour);
// router.get('/tour', viewControler.getTour);

module.exports = router;
