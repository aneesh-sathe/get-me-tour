const apiError = require('../utils/apiError');

const devError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const handleJWT = (err) => new apiError('please login again', 401);
const handleExpiry = (err) => new apiError('token expired, log in again', 401);
const prodError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      message: 'SOME ERROR',
    });
    console.log(err);
  }
};

module.exports = (err, req, res, next) => {
  err.status = err.status || 'fail';
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === 'development') {
    devError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'JsonWebTokenError') error = handleJWT(error);
    if (error.name === 'TokenExpiredError') error = handleExpiry(error);
    console.log(error);
    prodError(error, res);
  }
};
