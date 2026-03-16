const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, default: '' },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  shopName: { type: String, required: true },
  shopDescription: { type: String, default: '' },
  shopImage: { type: String, default: '' },
  avatar: { type: String, default: '' },
  address: { type: String, default: 'Not provided' },
  city: { type: String, default: 'Not provided' },
  pincode: { type: String, default: '000000' },
  licenseNumber: { type: String, default: '' },
  licenseImage: { type: String, default: '' },
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  bankDetails: {
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    accountName: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now }
});

sellerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Seller', sellerSchema);