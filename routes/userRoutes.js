const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateMe,
  getMe,
  uploadUserPhoto,
  uploadImageMiddleware,
  resizeUserPhoto,
  getUserProfileImage,
} = require('../controllers/userController');
const {
  protect,
  restrictTo,
  login,
  signup,
  updatePassword,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post(
  '/profile-image',
  protect,
  uploadImageMiddleware,
  resizeUserPhoto,
  uploadUserPhoto
);
router.get('/profile-image/:filename', protect, getUserProfileImage);
router.patch('/updateMe', protect, updateMe);
router.get('/me', protect, getMe);

router.patch('/updateMyPassword', protect, updatePassword);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.route('/').get(protect, restrictTo('admin'), getAllUsers);

module.exports = router;
