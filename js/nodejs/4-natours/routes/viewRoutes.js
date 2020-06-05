const express = require('express');

const router = express.Router();

// To działa dlatgo ze u gory w app.js właczylismy  pug
router.get('/', (req, res) => {
  res.status(200).render('base', {
    tour: 'forest hikker',
    user: { name: 'Lukasz Wysocki' },
  }); //render pug templare
});

router.get('/overview', (req, res) => {
  res.status(200).render('overview', {
    title: 'All Tours',
  });
});

router.get('/tour', (req, res) => {
  res.status(200).render('tour', {
    title: 'Forest Hikker Tour',
  });
});

module.exports = router;
