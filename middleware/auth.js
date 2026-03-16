const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Seller = require('../models/seller');
const DeliveryBoy = require('../models/deliveryboy');


exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ message: '❌ Not authorized, no token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role === 'customer' || decoded.role === 'admin') {
      req.user = await User.findById(decoded.id);
    } else if (decoded.role === 'seller') {
      req.user = await Seller.findById(decoded.id);
      req.user.role = 'seller';
    } else if (decoded.role === 'delivery') {
      req.user = await DeliveryBoy.findById(decoded.id);
      req.user.role = 'delivery';
    }

    if (!req.user) return res.status(401).json({ message: '❌ User not found' });
    next();
  } catch (err) {
    return res.status(401).json({ message: '❌ Not authorized, token failed' });
  }
};

exports.generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};