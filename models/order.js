const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    image: String,
    price: Number,
    quantity: Number,
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' }
  }],
  totalAmount: { type: Number, required: true },
  deliveryFee: { type: Number, default: 30 },
  tax: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: { type: String, enum: ['upi', 'card', 'cash'], required: true },
  paymentStatus: { type: String, enum: ['paid', 'unpaid', 'refunded'], default: 'unpaid' },
  paymentId: { type: String },
  deliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryBoy' },
  deliveryAddress: { type: String, required: true },
  deliveryLocation: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  deliveryBoyLocation: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  estimatedDelivery: { type: Date },
  deliveredAt: { type: Date },
  cancelReason: { type: String },
  otp: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);