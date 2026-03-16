const Product = require('../models/product');

// Get all products (approved only)
exports.getProducts = async (req, res) => {
  try {
    const { category, city, search, sort } = req.query;
    let query = { isApproved: true, isAvailable: true };

    if (category && category !== 'all') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    let products = Product.find(query).populate('seller', 'shopName city address rating');

    if (sort === 'price_low') products = products.sort({ price: 1 });
    else if (sort === 'price_high') products = products.sort({ price: -1 });
    else if (sort === 'rating') products = products.sort({ rating: -1 });
    else products = products.sort({ createdAt: -1 });

    const result = await products;
    res.status(200).json({ success: true, count: result.length, products: result });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'shopName city address rating phone')
      .populate('suggestedSnacks', 'name price images category rating');

    if (!product) return res.status(404).json({ message: '❌ Product not found!' });
    res.status(200).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Get food & snacks
exports.getFoodAndSnacks = async (req, res) => {
  try {
    const products = await Product.find({
      category: { $in: ['food', 'snacks'] },
      isApproved: true,
      isAvailable: true
    }).populate('seller', 'shopName city');
    res.status(200).json({ success: true, products });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Seller: Add product
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, discountPrice, category, subCategory, stock, unit, volume, brand, tags } = req.body;
    const images = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];

    const product = await Product.create({
      name, description, price, discountPrice, category, subCategory,
      stock, unit, volume, brand, images,
      tags: tags ? tags.split(',') : [],
      seller: req.user._id
    });

    res.status(201).json({ success: true, message: '✅ Product added! Waiting for admin approval.', product });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Seller: Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user._id });
    if (!product) return res.status(404).json({ message: '❌ Product not found!' });

    const updateData = { ...req.body };
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(f => '/uploads/' + f.filename);
    }
    if (updateData.tags) updateData.tags = updateData.tags.split(',');

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json({ success: true, message: '✅ Product updated!', product: updated });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Seller: Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user._id });
    if (!product) return res.status(404).json({ message: '❌ Product not found!' });
    await product.deleteOne();
    res.status(200).json({ success: true, message: '✅ Product deleted!' });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Seller: Get their products
exports.getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id });
    res.status(200).json({ success: true, products });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};