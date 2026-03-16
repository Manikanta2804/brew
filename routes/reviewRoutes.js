const express = require('express');
const router = express.Router();
const { addReview, getProductReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

router.post('/', protect, uploadMultiple, addReview);
router.get('/:productId', getProductReviews);

module.exports = router;