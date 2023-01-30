const express = require('express');
const fs = require('fs');
const router = express.Router();
const tourController = require('../controllers/tourControllers');
const authController = require('./../controllers/authController');

router
  .route('/best-tours')
  .get(tourController.alias, tourController.getAllTours);

router.route('/get-stat').get(tourController.getStats);

router
  .route('/')
  .get(authController.protectRoute, tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .post(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protectRoute,
    authController.restrict('admin'),
    tourController.deleteTour
  );

module.exports = router;
