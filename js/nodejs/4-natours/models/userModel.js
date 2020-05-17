const crypto = require('crypto');
const mongoose = require('mongoose');
// const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// Torzymy scheme - czyli cos jakby wzor tablicy - kolekcji
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    name: {
      type: String,
      required: [true, 'Please tell us your name!'],
    },
    photo: String,
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false, //nie bedzie zwracane w outpucie
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same!',
      },
    },
    passwordChangedAt: { type: Date },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    // to sa dodakowe opckje schemy
    toJSON: {
      //zawsze gdy biedzie zwracany json to beda wirtualne kolumny
      virtuals: true,
    },
    // to sa dodakowe opckje schemy
    toObject: {
      //zawsze gdy biedzie zwracany obiekt to beda wirtualne kolumny
      virtuals: true,
    },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); //jak haslo nie jest ruszane to nic nie robimy
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next(); //gdy nie jest to nowy user tylko modyfikacja istniejaceg  i to modyfikacja hasla
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// to jest querry middleware
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// To cos sie nazywa instances method i jest dostpona dla wszystkich dokumentow ktore znajdzie funkcja
// i porownuje sie haslo dane do zahaszawane
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // JWTTimestamp to czas kiedy user logowal
  // changedTimestamp to czas ostatniej zmiany hasla
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordRessetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); //Zahaszowany token trzymamy w bazie
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// Tworzymy model - czyli kolekcje
const User = mongoose.model('User', userSchema);

module.exports = User;

/*
const testTour = new Tour({
  name: 'The Forest Hiker',
  rating: 4.7,
  price: 497,
});

testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log(err.errmsg);
  });
*/
