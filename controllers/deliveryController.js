const DeliveryBoy = require('../models/deliveryboy');
const Order = require('../models/order');
const { generateToken } = require('../middleware/auth');

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const delivery = await DeliveryBoy.findOne({ phone }).select('+password');
    if (!delivery) return res.status(404).json({ message: '❌ Delivery boy not found!' });

    const isMatch = await delivery.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: '❌ Wrong password!' });
    if (!delivery.isApproved) return res.status(403).json({ message: '❌ Account pending approval!' });

    const token = generateToken(delivery._id, 'delivery');
    res.status(200).json({
      success: true,
      token,
      delivery: { id: delivery._id, name: delivery.name, phone: delivery.phone, role: 'delivery' }
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

exports.getAssignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ deliveryBoy: req.user._id, status: { $in: ['confirmed', 'preparing', 'out_for_delivery'] } })
      .populate('customer', 'name phone address')
      .populate('items.product', 'name images');
    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, otp } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: '❌ Order not found!' });

    if (status === 'delivered') {
      if (order.otp !== otp) return res.status(400).json({ message: '❌ Wrong OTP!' });
      order.deliveredAt = Date.now();
      order.paymentStatus = 'paid';
    }

    order.status = status;
    await order.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(order._id.toString()).emit('order_status_update', { orderId: order._id, status });

    res.status(200).json({ success: true, message: '✅ Order status updated!', order });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng, orderId } = req.body;
    await DeliveryBoy.findByIdAndUpdate(req.user._id, {
      currentLocation: { type: 'Point', coordinates: [lng, lat] }
    });

    const io = req.app.get('io');
    if (orderId) io.to(orderId).emit('location_update', { lat, lng, orderId });

    res.status(200).json({ success: true, message: '✅ Location updated!' });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};