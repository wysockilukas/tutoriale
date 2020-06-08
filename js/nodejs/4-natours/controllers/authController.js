const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const crateJWT = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = crateJWT(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

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
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
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

  // console.log('szukamy ', email);
  // console.log(user);

  // correctPassword to nasza funkcja zdefiniowalism ja w modelu
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  //3 Jak ok to wyslij JWT
  createSendToken(user, 200, res);
});

exports.logOut = (req, res) => {
  const token = 'logout';
  const cookieOptions = {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  };
  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  res.status(200).json({
    status: 'success',
  });
};

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

// protect sprawdza czy user jest zalogowany
exports.protect = catchAsync(async (req, res, next) => {
  // 1) get token
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    // jak nie ma tokenu w headerze to sprawdzamy czy jest cookie
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError('brak tokenu, Zaloguj sie', 401));
  }

  // 2) weryfikacja tokenu
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //dzięki trikowi na promisiffy odpalamy to asynchronicznie
  // console.log(promisify.toString());
  // 3) Czy user ciagle istnieje
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('nie ma takiego usera', 401));
  }
  // 4) Czy user zmienil haslo po wyslaniu tokenu
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    next(new AppError('Zmienilo sie haslo, zaloguj sie ponownie', 401));
  }

  // jak kod dojdzie do tego miejsca to oznacza ze user przeszedl wszystkie uprawnienia
  req.user = freshUser; //moze to sie przyda
  next();
});

// tylko dla renedroanych stron , nie zwaraca bldow
// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser; //w tym locals tworzymy zmienna do ktorej ma dostep template pug
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  //roles jest tablica rol
  return catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      //gdy user z requet nie jets w tablicy
      return next(new AppError('nie masz uprawnien do', 403));
    }
    next();
  });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1 pobierz usera z maila
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('Nie ma takiego maila', 404));
  }
  // 2 utworz jakis random token
  const resetToken = user.createPasswordRessetToken();
  await user.save({ validateBeforeSave: false }); //w funkcji createPasswordRessetToken utworzyslimy nowe pole w obiekcie user, a teraz roimy zapisz

  // 3 Wyslij jako emial
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/token=${resetToken}`;

  try {
    sendEmail({ email: req.body.email, subject: 'reset hasla', message: `kliknij ten <a href="${resetUrl}">link</a>` });

    res.status(200).json({
      status: 'success',
      message: 'poszedl email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Nie udalo sie wyslac maila', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1 get user based token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

  // 2 Jak taki user istnieje i token nie wygasl to mozna resetowac haslo
  if (!user) {
    return next(new AppError('Nie ma uzytkownika dla takiego tokena lu token wygasl', 404));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3  passwordChangedAt

  // 4 logujemy uzytkownika czyli wysylamy mu token
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1 Get user, wykorzystuje protected middleware ktore zwraca usera
  const userId = req.user._id;
  const currentPassword = req.body.currentpassword;
  const user = await User.findById(userId).select('+password'); //to wyszmusza ze pole password jest zwrócone

  if (!user) {
    return next(new AppError('Zaloguj sie jeszcze raz', 401));
  }

  // 2 Czy biezace haslo jest ok
  // funkcja correctPassword jest zdefiniowana w modelu
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError('zle haslo password!', 401));
  }

  // 3 update haslo
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4 zaloguj
  createSendToken(user, 200, res);
});
