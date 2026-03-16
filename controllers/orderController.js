const Order = require('../models/order');
const Product = require('../models/product');
const Payment = require('../models/payment');

// Place order
exports.placeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, deliveryLocation, paymentMethod, paymentId, upiId, upiApp } = req.body;

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;
      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: product.price,
        quantity: item.quantity,
        seller: product.seller
      });
    }

    const tax = Math.round(totalAmount * 0.05);
    const deliveryFee = 30;
    const finalAmount = totalAmount + tax + deliveryFee;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      totalAmount,
      tax,
      deliveryFee,
      finalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'unpaid' : 'paid',
      paymentId,
      deliveryAddress,
      deliveryLocation,
      otp,
      status: 'confirmed'
    });

    await Payment.create({
      order: order._id,
      customer: req.user._id,
      amount: finalAmount,
      method: paymentMethod,
      status: paymentMethod === 'cash' ? 'pending' : 'success',
      transactionId: paymentId || 'TXN' + Date.now(),
      upiId,
      upiApp
    });

    res.status(201).json({
      success: true,
      message: '✅ Order placed successfully!',
      order: { id: order._id, status: order.status, finalAmount: order.finalAmount, otp: order.otp }
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Get customer orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('items.product', 'name images')
      .populate('deliveryBoy', 'name phone')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images price')
      .populate('deliveryBoy', 'name phone avatar vehicleType vehicleNumber currentLocation');
    if (!order) return res.status(404).json({ message: '❌ Order not found!' });
    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: '❌ Order not found!' });
    if (order.status === 'delivered') return res.status(400).json({ message: '❌ Cannot cancel delivered order!' });

    order.status = 'cancelled';
    order.cancelReason = req.body.reason || 'Cancelled by customer';
    await order.save();

    res.status(200).json({ success: true, message: '✅ Order cancelled!' });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};
