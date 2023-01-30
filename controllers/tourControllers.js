const express = require('express');
const fs = require('fs');
const apiError = require('../utils/apiError');
const Tour = require('./../models/tourModel');
const feature = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
// ALIASING - SETTING UP PRE-DEFINED FILTER CONDITIONS
exports.alias = (req, res, next) => {
  req.query.limit = '2';
  req.query.sort = '-rating price';
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'invalid request',
    });
  }
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new feature(Tour.find(), req.query)
    .filter()
    .sort()
    .paginate()
    .limitFields();

  const newTour = await features.query;
  // AWAITING PROMISE GIVEN BY TOUR.FIND() FUNCTION
  res.status(200).json({
    status: 'success',
    results: newTour.length,
    data: {
      tour: newTour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.findById(req.params.id);
  if (!newTour) {
    return next(new apiError('Tour Does not Exist', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!newTour) {
    return next(new apiError('Tour Does not Exist', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.findByIdAndDelete(req.params.id);
  if (!newTour) {
    return next(new apiError('Tour Does not Exist', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getStats = catchAsync(async (req, res, next) => {
  const stat = await Tour.aggregate([
    {
      $group: {
        _id: null,
        sumRating: { $sum: '$rating' },
        numRating: { $count: {} },
        avgRating: { $avg: '$rating' },
        avgPrice: { $avg: '$price' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: stat,
  });
});
