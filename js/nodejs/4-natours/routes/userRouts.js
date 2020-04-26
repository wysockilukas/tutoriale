const express = require('express');
const userControler = require('./../controllers/userController');

const router = express.Router();

router.route('/').get(userControler.getAllUsers).post(userControler.createUser);
router.route('/:id').get(userControler.getUser).patch(userControler.updateUser).delete(userControler.deleteUser);

module.exports = router;
