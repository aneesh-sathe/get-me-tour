const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const apiError = require('./../utils/apiError');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    pass: req.body.pass,
    passConfirm: req.body.passConfirm,
  });

  const token = signToken(newUser._id);
  res.json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const pass = req.body.pass;

  if (!email || !pass) {
    return next(new apiError('please enter email and password', 400));
  }

  const user = await User.findOne({ email }).select('+pass');
  if (!user || !(await user.checkPass(pass, user.pass))) {
    return next(new apiError('Incorrect Credentials'), 401);
  }
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protectRoute = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new apiError('token not found!', 401));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new apiError('user does not exist', 401));
  }

  if (user.passChange(decoded.iat)) {
    return next(new apiError('password changed recently, login again'), 401);
  }
  req.user = user;
  next();
});

exports.restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new apiError('permission denied', 403));
    }
    next();
  };
};

exports.forgotPass = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new apiError('user does not exist', 404));
  }

  const resetToken = user.passwordResetToken();
  await user.save({ validateBeforeSave: false });
});

exports.resetPass = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.body.params)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passResetExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new apiError('token expired', 400));
  }

  user.pass = req.body.pass;
  user.passConfirm = req.body.passConfirm;
  user.passwordResetToken = undefined;
  user.passResetExpiry = undefined;
  await user.save();

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
