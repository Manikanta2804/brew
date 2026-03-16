const express = require('express');
const router = express.Router();
const { createAdmin, getDashboard, updateSeller, approveProduct, getAllOrders, getTransactions, getHiringApplications, approveHiring, assignDeliveryBoy, getSellers, getDeliveryBoys, getUsers } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.post('/create', createAdmin);
router.get('/dashboard', protect, adminOnly, getDashboard);
router.get('/users', protect, adminOnly, getUsers);
router.get('/sellers', protect, adminOnly, getSellers);
router.put('/sellers/:id', protect, adminOnly, updateSeller);
router.put('/products/:id/approve', protect, adminOnly, approveProduct);
router.get('/orders', protect, adminOnly, getAllOrders);
router.put('/orders/:id/assign', protect, adminOnly, assignDeliveryBoy);
router.get('/transactions', protect, adminOnly, getTransactions);
router.get('/hiring', protect, adminOnly, getHiringApplications);
router.put('/hiring/:id', protect, adminOnly, approveHiring);
router.get('/delivery-boys', protect, adminOnly, getDeliveryBoys);

module.exports = router;