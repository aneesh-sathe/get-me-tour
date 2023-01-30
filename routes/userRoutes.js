const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const authController = require('./../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPass);
router.post('/resetPassword', authController.resetPass);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .post(userController.getUser)
  .patch(userController.updateUser);
router.route('/:users/:id').delete(userController.deleteUser);

module.exports = router;
