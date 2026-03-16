const Payment = require('../models/payment');
const Order = require('../models/order');

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ customer: req.user._id })
      .populate('order', 'status finalAmount createdAt')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, transactionId, method, upiId, upiApp } = req.body;
    const payment = await Payment.findOneAndUpdate(
      { order: orderId },
      { status: 'success', transactionId, upiId, upiApp },
      { new: true }
    );
    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid', paymentId: transactionId });
    res.status(200).json({ success: true, message: '✅ Payment verified!', payment });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};