const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './../../config.env' });

const reviews = JSON.parse(fs.readFileSync('./reviews.json', 'utf-8'));

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// Definiujemy polaczenie z baza - connexction strin DM byl podany w atlasie
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('Polaczenie z baza ', con.connection.name);
  });

const importData = async () => {
  try {
    await Review.create(reviews);
    console.log('Dane zaimportowane');
    mongoose.connection.close();
  } catch (error) {
    console.log(error);
  }
};

const deleteAllDate = async () => {
  try {
    await Review.deleteMany();
    console.log('Dane usuniete');
    mongoose.connection.close();
    // process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '--import') {
  importData();
}

if (process.argv[2] === '--delete') {
  deleteAllDate();
}

// mongoose.connection.close();
