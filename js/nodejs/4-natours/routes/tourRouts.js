const express = require('express');
const { getAllTours, createTour, getTour, updateTour, deleteTour, checkId, checkBody } = require('./../controllers/tourController');

const router = express.Router(); // to jest middleware function

// to jest koljena middleware function
// router.param('id', (req, res, next, val) => {
//   console.log(`Nie wiem po co to, ale zwraca ${val}`);
//   next();
// });
// checkId to nasz param middlewarw, on sie wywoluje jak pojawi sie param,etr id w urlu
// i tam wykrywamy i jak jest niepoprawny to zrwacamy respone error i retutn i nie wywolujemy next, czyli pzrerywamy cykl
router.param('id', checkId);
// router.use(checkBody);

router.route('/').get(getAllTours).post(checkBody, createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
