const express = require('express');
const authControler = require('../controllers/authController');
const userControler = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authControler.signUp);
router.post('/login', authControler.login);
router.post('/forgotPassword', authControler.forgotPassword);
router.patch('/resetPassword/:token', authControler.resetPassword);

//router.use(authControler.protect);  //to jest middleware a te uruchamiane sa w kolenosci sekwencyjnie ,wiec ten byc sie wykonal i zabezpieczyl wszsytki ponizej

router.patch('/updateMyPassword', authControler.protect, authControler.updatePassword);
router.patch('/me', userControler.getMe, userControler.getUser);
router.patch('/updateMe', authControler.protect, userControler.updateMe);
router.delete('/deleteMe', authControler.protect, userControler.deleteMe);

router.use(authControler.restrictTo('admin')); //to zabezpieczarouty ponziej, bo jak kod dotrze do tego miekjsaca to ten middleware sie wykona
router.route('/').get(userControler.getAllUsers);
router.route('/:id').delete(authControler.protect, userControler.deleteUser);
router.route('/:id').patch(authControler.protect, userControler.updateUser);
router.route('/').post(authControler.protect, userControler.createUser);

module.exports = router;
