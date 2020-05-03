const mongoose = require('mongoose');
const slugify = require('slugify');

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
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
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
      // enum: {
      //   values: ['easy', 'medium', 'difficult'],
      //   message: 'Difficulty is either: easy, medium, difficult',
      // },
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
      // validate: {
      //   validator: function (val) {
      //     // this only points to current doc on NEW document creation
      //     return val < this.price;
      //   },
      //   message: 'Discount price ({VALUE}) should be below regular price',
      // },
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
    // secretTour: {
    //   type: Boolean,
    //   default: false,
    // },
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

//Tworztmy wirualna kolune taki alias, ktory jest zwracany tylko przy pobieraniu
// Uwaga callback nie moze byc arrowfunction wazjy jest ten this
tourSchema.virtual('durationWeeks').get(function () {
  // return this.duration / 7;
  if (this.duration) return (this.duration / 7).toFixed(2);
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
