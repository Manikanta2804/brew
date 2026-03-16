const Seller = require('../models/seller');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, shopName, shopDescription, address, city, pincode, licenseNumber } = req.body;

    if (!name || !phone || !password || !shopName) {
      return res.status(400).json({ message: '❌ Name, phone, password and shop name are required!' });
    }

    const existing = await Seller.findOne({ phone });
    if (existing) {
      return res.status(400).json({ message: '❌ Phone already registered!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sellerData = {
      name: name,
      email: email || '',
      phone: phone,
      password: hashedPassword,
      shopName: shopName,
      shopDescription: shopDescription || '',
      address: address || 'Not provided',
      city: city || 'Not provided',
      pincode: pincode || '000000',
      licenseNumber: licenseNumber || ''
    };

    if (req.files) {
      if (req.files.shopImage) sellerData.shopImage = '/uploads/' + req.files.shopImage[0].filename;
      if (req.files.licenseImage) sellerData.licenseImage = '/uploads/' + req.files.licenseImage[0].filename;
      if (req.files.photo) sellerData.avatar = '/uploads/' + req.files.photo[0].filename;
    }

    const seller = new Seller(sellerData);
    await seller.save();

    res.status(201).json({
      success: true,
      message: '✅ Seller registered! Waiting for admin approval.',
      seller: {
        id: seller._id,
        name: seller.name,
        shopName: seller.shopName,
        isApproved: seller.isApproved
      }
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: '❌ Phone and password are required!' });
    }

    const seller = await Seller.findOne({ phone });
    if (!seller) {
      return res.status(404).json({ message: '❌ Seller not found!' });
    }

    const isMatch = await seller.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: '❌ Wrong password!' });
    }

    if (!seller.isApproved) {
      return res.status(403).json({ message: '❌ Account pending admin approval! Please wait.' });
    }

    const token = generateToken(seller._id, 'seller');

    res.status(200).json({
      success: true,
      message: '✅ Login successful!',
      token,
      user: {
        id: seller._id,
        name: seller.name,
        shopName: seller.shopName,
        role: 'seller'
      }
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.user._id);
    if (!seller) {
      return res.status(404).json({ message: '❌ Seller not found!' });
    }
    res.status(200).json({ success: true, seller });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, shopName, shopDescription, address, city, pincode } = req.body;

    const updateData = {
      name: name,
      shopName: shopName,
      shopDescription: shopDescription,
      address: address,
      city: city,
      pincode: pincode
    };

    if (req.files) {
      if (req.files.shopImage) updateData.shopImage = '/uploads/' + req.files.shopImage[0].filename;
      if (req.files.photo) updateData.avatar = '/uploads/' + req.files.photo[0].filename;
    }

    const seller = await Seller.findByIdAndUpdate(req.user._id, updateData, { new: true });
    res.status(200).json({ success: true, message: '✅ Profile updated!', seller });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};