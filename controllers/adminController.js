const User = require('../models/User');
const Seller = require('../models/seller');
const DeliveryBoy = require('../models/deliveryboy');
const Order = require('../models/order');
const Payment = require('../models/payment');
const Product = require('../models/product');
const HiringApplication = require('../models/HiringApplication');
const bcrypt = require('bcryptjs');

// Create admin (first time only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, phone, password, adminSecret } = req.body;
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: '❌ Invalid admin secret!' });
    }
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      return res.status(400).json({ message: '❌ Admin already exists!' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new User({ name, phone, password: hashedPassword, role: 'admin' });
    await admin.save();
    res.status(201).json({
      success: true,
      message: '✅ Admin created successfully!',
      admin: { id: admin._id, name: admin.name }
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Dashboard stats
exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalSellers, totalOrders, totalDeliveryBoys, totalProducts, payments] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Seller.countDocuments(),
      Order.countDocuments(),
      DeliveryBoy.countDocuments({ isApproved: true }),
      Product.countDocuments({ isApproved: true }),
      Payment.find({ status: 'success' })
    ]);
    const totalRevenue = payments.reduce((a, p) => a + p.amount, 0);
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: new Date().setHours(0,0,0,0) } });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const pendingSellers = await Seller.countDocuments({ isApproved: false });
    const pendingDelivery = await HiringApplication.countDocuments({ status: 'pending' });
    res.status(200).json({
      success: true,
      stats: { totalUsers, totalSellers, totalOrders, totalDeliveryBoys, totalProducts, totalRevenue, todayOrders, pendingOrders, pendingSellers, pendingDelivery }
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Approve/Reject Seller
exports.updateSeller = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const seller = await Seller.findByIdAndUpdate(req.params.id, { isApproved }, { new: true });
    res.status(200).json({ success: true, message: `✅ Seller ${isApproved ? 'approved' : 'rejected'}!`, seller });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Approve product
exports.approveProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isApproved: req.body.isApproved }, { new: true });
    res.status(200).json({ success: true, message: '✅ Product status updated!', product });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name phone')
      .populate('deliveryBoy', 'name phone')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Get all payments/transactions
exports.getTransactions = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('customer', 'name phone')
      .populate('order', 'finalAmount status')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Hiring applications
exports.getHiringApplications = async (req, res) => {
  try {
    const applications = await HiringApplication.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Approve hiring application
exports.approveHiring = async (req, res) => {
  try {
    const application = await HiringApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: '❌ Application not found!' });
    const { status, adminNote, password } = req.body;
    application.status = status;
    application.adminNote = adminNote;
    await application.save();
    if (status === 'approved') {
      const existing = await DeliveryBoy.findOne({ phone: application.phone });
      if (!existing) {
        const hashedPassword = await bcrypt.hash(password || 'BrewDash@123', 10);
        const db = new DeliveryBoy({
          name: application.name,
          phone: application.phone,
          email: application.email || '',
          password: hashedPassword,
          vehicleType: application.vehicleType,
          vehicleNumber: application.vehicleNumber,
          licenseNumber: application.licenseNumber,
          licenseImage: application.licenseImage || '',
          aadharNumber: application.aadharNumber || '',
          aadharImage: application.aadharImage || '',
          city: application.city,
          area: application.area || '',
          isApproved: true,
          isActive: true
        });
        await db.save();
      }
    }
    res.status(200).json({ success: true, message: `✅ Application ${status}!` });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Assign delivery boy to order
exports.assignDeliveryBoy = async (req, res) => {
  try {
    const { deliveryBoyId } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, {
      deliveryBoy: deliveryBoyId,
      status: 'out_for_delivery'
    }, { new: true });
    res.status(200).json({ success: true, message: '✅ Delivery boy assigned!', order });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Get all sellers
exports.getSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, sellers });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Get all delivery boys
exports.getDeliveryBoys = async (req, res) => {
  try {
    const deliveryBoys = await DeliveryBoy.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, deliveryBoys });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};
