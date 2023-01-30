const express = require('express');
const { features } = require('process');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const feature = require('./../utils/apiFeatures');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new feature(User.find(), req.query)
    .filter()
    .sort()
    .paginate()
    .limitFields();

  const users = await features.query;
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route not yet defined',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route not yet defined',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route not yet defined',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route not yet defined',
  });
};
