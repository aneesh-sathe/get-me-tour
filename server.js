const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASS_DB);
process.on('uncaughtException', (err) => {
  console.log(err.message, err.name);
  process.exit(1);
});

const app = require('./app');
const mongoose = require('mongoose');

mongoose.connect(DB, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const server = app.listen('8000', () => {
  console.log('hey');
});

process.on('unhandledRejection', (err) => {
  server.close(() => {
    process.exit(1);
  });
});
