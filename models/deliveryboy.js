const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const deliveryBoySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  vehicleType: { type: String, enum: ['bike', 'scooter', 'bicycle', 'car'], required: true },
  vehicleNumber: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  licenseImage: { type: String },
  aadharNumber: { type: String },
  aadharImage: { type: String },
  city: { type: String, required: true },
  area: { type: String },
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: false },
  currentLocation: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  totalDeliveries: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

deliveryBoySchema.index({ currentLocation: '2dsphere' });

deliveryBoySchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('DeliveryBoy', deliveryBoySchema);