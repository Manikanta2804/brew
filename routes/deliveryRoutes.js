const express = require('express');
const router = express.Router();
const { login, getAssignedOrders, updateOrderStatus, updateLocation } = require('../controllers/deliveryController');
const { protect } = require('../middleware/auth');
const { deliveryOnly } = require('../middleware/delivery');

router.post('/login', login);
router.get('/orders', protect, deliveryOnly, getAssignedOrders);
router.put('/orders/:id/status', protect, deliveryOnly, updateOrderStatus);
router.post('/location', protect, deliveryOnly, updateLocation);

module.exports = router;