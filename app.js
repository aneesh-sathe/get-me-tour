const { fail } = require('assert');
const express = require('express');
const app = express();
const mor = require('morgan');
const apiError = require('./utils/apiError');
const tourRouter = require(`./routes/tourRoutes`);
const userRouter = require(`./routes/userRoutes`);
const errorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const expSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(mor('dev'));
}

const limiter = rateLimit({
  max: 10,
  windowMs: 60 * 60 * 1000,
  message: 'user blocked for 1hr due to too many requests',
});
app.use('/api', limiter);

app.use(express.json());
app.use(expSanitize());
app.use(xss());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(
    new apiError(
      `path ${req.url} does not exist Redirect to /api/v1/tours`,
      404
    )
  );
});

app.use(errorHandler);

module.exports = app;
