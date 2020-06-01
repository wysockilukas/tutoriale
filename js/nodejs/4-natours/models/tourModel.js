const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

// Torzymy scheme - czyli cos jakby wzor tablicy - kolekcji
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          // console.log(val, this.price);
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //false - nie mozna tego wybrac przez api, tru jest zawsze nie mozna nie wybrac
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'], //opcja do wybore bedzie tylko punkt
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        //ustawiamy klucze obce do id user
        //childe referensing
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    // to sa dodakowe opckje schemy
    toJSON: {
      //zawsze gdy biedzie zwracany json to beda wirtualne kolumny
      virtuals: true,
    },
    // to sa dodakowe opckje schemy
    toObject: {
      //zawsze gdy biedzie zwracany json to beda wirtualne kolumny
      virtuals: true,
    },
  }
);

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

//DOCUMENT MIDDLERWARE
//Tworztmy wirualna kolune taki alias, ktory jest zwracany tylko przy pobieraniu
// Uwaga callback nie moze byc arrowfunction wazjy jest ten this
tourSchema.virtual('durationWeeks').get(function () {
  // return this.duration / 7;
  if (this.duration) return (this.duration / 7).toFixed(2);
});

// virtual populate - tworzymy wirtualne child id
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', //bo w modelu reviews klucz obcy do tour to tours
  localField: '_id', // bo w modelu reviews tour to _id w modelu tours
});

// docuement middleware - chyba cos jak trugger - startuje pzred save lub create (ale nie mie insermany)
tourSchema.pre('save', function (next) {
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

//ten middleware wykonuje sie juz po zdarzeniu, doc to zapisany dokumnet
tourSchema.post('save', function (doc, next) {
  // console.log(doc);
  next();
});

// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);  //nadpisujemy id obiekten user
//   next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function ( next) {
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }); //Dodajmy do zapytania fragmrnt, zeby nigdy nie mozna było zwrócić secretTour
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

tourSchema.post(/^find/, function (docs, next) {
  // console.log(`Query trwało ${Date.now() - this.start} milisekund`);
  // console.log(docs);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// Tworzymy model - czyli kolekcje
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

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
