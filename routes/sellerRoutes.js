const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/sellerController');
const { protect } = require('../middleware/auth');
const { uploadFields } = require('../middleware/upload');

router.post('/register', uploadFields, register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadFields, updateProfile);

module.exports = router;