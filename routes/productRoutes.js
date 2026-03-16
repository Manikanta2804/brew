const express = require('express');
const router = express.Router();
const { getProducts, getProduct, getFoodAndSnacks, addProduct, updateProduct, deleteProduct, getSellerProducts } = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { sellerOnly } = require('../middleware/seller');
const { uploadMultiple } = require('../middleware/upload');

router.get('/', getProducts);
router.get('/food-snacks', getFoodAndSnacks);
router.get('/:id', getProduct);
router.post('/', protect, sellerOnly, uploadMultiple, addProduct);
router.put('/:id', protect, sellerOnly, uploadMultiple, updateProduct);
router.delete('/:id', protect, sellerOnly, deleteProduct);
router.get('/seller/my-products', protect, sellerOnly, getSellerProducts);

module.exports = router;