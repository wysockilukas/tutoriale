const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './../../config.env' });

const daneZPliku = fs.readFileSync('tours.json', 'utf-8');
const daneJson = JSON.parse(daneZPliku);

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
    await Tour.create(daneJson);
    console.log('Dane zaimportowane');
    mongoose.connection.close();
  } catch (error) {
    console.log(error);
  }
};

const deleteAllDate = async () => {
  try {
    await Tour.deleteMany();
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
