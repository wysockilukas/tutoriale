const express = require('express');
const authControler = require('../controllers/authController');
const userControler = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authControler.signUp);
router.post('/login', authControler.login);

router.route('/').get(userControler.getAllUsers);
// router.route('/:id').get(userControler.getUser).patch(userControler.updateUser).delete(userControler.deleteUser);

module.exports = router;
