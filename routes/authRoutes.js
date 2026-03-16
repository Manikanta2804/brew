const express = require('express');
const router = express.Router();
const {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
  forgotPassword,
  verifyOTP,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadSingle, updateProfile);

module.exports = router;