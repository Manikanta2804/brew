const express = require('express');
const router = express.Router();
const { getMyPayments, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.get('/my-payments', protect, getMyPayments);
router.post('/verify', protect, verifyPayment);

module.exports = router;
