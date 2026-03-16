const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['upi', 'card', 'cash'], required: true },
  status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
  transactionId: { type: String },
  upiId: { type: String },
  upiApp: { type: String },
  cardLast4: { type: String },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  refundId: { type: String },
  refundAmount: { type: Number },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);