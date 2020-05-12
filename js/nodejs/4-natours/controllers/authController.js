const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const crateJWT = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'w budowie',
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = crateJWT(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      tour: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1 Czy email i haslo wystepuja
  if (!email || !password) {
    return next(new AppError('Nie ma emaila lub hasla', 400));
  }
  //2 Czt login wystepuje i czy haslo jest Ok
  // const fUser = await User.find({ email: email });
  const user = await User.findOne({ email }).select('+password'); //to wyszmusza ze pole password jest zwrócone

  // correctPassword to nasza funkcja zdefiniowalism ja w modelu
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  //3 Jak ok to wyslij JWT
  const token = crateJWT(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'w budowie',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'w budowie',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'w budowie',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) get token
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('brak tokenu, Zaloguj sie', 401));
  }

  // 2) weryfikacja tokenu
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Czy user ciagle istnieje
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('nie ma takiego usera', 401));
  }
  // 4) Czy user zmienil haslo po wyslaniu tokenu
  console.log(freshUser, decoded);
  next();
});
