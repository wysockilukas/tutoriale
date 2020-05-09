const mongoose = require('mongoose');
//ta blibliotek jest do oblsugi env
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

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

// console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('Serwer pracuje na porcie ', port);
});

// to przechwytuje wszsytkie nie obsluzone promises
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

/*
npm i eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-config-airbnb eslint-plugin-node eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react  --save-dev

npm install --save-dev ndb
*/

// TEST
