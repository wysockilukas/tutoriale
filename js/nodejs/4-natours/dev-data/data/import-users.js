const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const User = require('../../models/userModel');

dotenv.config({ path: './../../config.env' });

const users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));

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
    await User.create(users, { validateBeforeSave: false });
    console.log('Dane zaimportowane');
    mongoose.connection.close();
  } catch (error) {
    console.log(error);
  }
};

const deleteAllDate = async () => {
  try {
    await User.deleteMany();
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
