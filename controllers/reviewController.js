const Review = require('../models/review');
const Product = require('../models/product');
const Order = require('../models/order');

exports.addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if user bought this product
    const order = await Order.findOne({
      customer: req.user._id,
      'items.product': productId,
      status: 'delivered'
    });
    if (!order) return res.status(400).json({ message: '❌ You can only review products you have purchased!' });

    // Check if already reviewed
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) return res.status(400).json({ message: '❌ You already reviewed this product!' });

    const images = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      rating,
      comment,
      images
    });

    // Update product rating
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, { rating: avgRating.toFixed(1), numReviews: reviews.length });

    res.status(201).json({ success: true, message: '✅ Review added!', review });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};