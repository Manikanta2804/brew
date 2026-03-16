const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');
const { sendOTPEmail } = require('../config/email');
const { sendOTPSms } = require('../config/sms');

// Register Customer
exports.register = async (req, res) => {
  try {
    const { name, phone, password, email, address, city, pincode } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ message: '❌ Name, phone and password are required!' });
    }
    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ message: '❌ Phone already registered!' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, phone, password: hashedPassword, email, address, city, pincode });
    await user.save();

    const token = generateToken(user._id, user.role);
    res.status(201).json({
      success: true,
      message: '✅ Registered successfully!',
      token,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Login Customer
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: '❌ Phone and password are required!' });
    }
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: '❌ User not found!' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: '❌ Wrong password!' });

    const token = generateToken(user._id, user.role);
    res.status(200).json({
      success: true,
      message: '✅ Login successful!',
      token,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role, avatar: user.avatar }
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { phone, password, adminSecret } = req.body;
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: '❌ Invalid admin secret!' });
    }
    const user = await User.findOne({ phone, role: 'admin' });
    if (!user) return res.status(404).json({ message: '❌ Admin not found!' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: '❌ Wrong password!' });

    const token = generateToken(user._id, 'admin');
    res.status(200).json({
      success: true,
      message: '✅ Admin login successful!',
      token,
      user: { id: user._id, name: user.name, phone: user.phone, role: 'admin' }
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, address, city, pincode } = req.body;
    const updateData = { name, email, address, city, pincode };
    if (req.file) updateData.avatar = '/uploads/' + req.file.filename;
    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
    res.status(200).json({ success: true, message: '✅ Profile updated!', user });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { phone, method } = req.body;
    if (!phone) return res.status(400).json({ message: '❌ Phone number is required!' });

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: '❌ No account found with this phone number!' });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP
    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    console.log(`🔐 OTP for ${phone}: ${otp}`); // Always log for debugging

    if (method === 'email') {
      if (!user.email) {
        return res.status(400).json({ message: '❌ No email found for this account! Use SMS instead.' });
      }
      try {
        await sendOTPEmail(user.email, otp, user.name);
        res.status(200).json({
          success: true,
          message: `✅ OTP sent to ${user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`,
          devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
      } catch (emailErr) {
        console.error('Email error:', emailErr.message);
        res.status(500).json({ message: '❌ Failed to send email. Try SMS instead.' });
      }
    } else {
      // SMS
      try {
        const smsResult = await sendOTPSms(phone, otp);
        if (smsResult.success) {
          res.status(200).json({
            success: true,
            message: `✅ OTP sent to +91${phone}`,
            devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
          });
        } else {
          // SMS failed - return OTP in dev mode
          res.status(200).json({
            success: true,
            message: process.env.NODE_ENV === 'development' ? `✅ OTP (Dev): ${otp}` : '✅ OTP sent!',
            devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
          });
        }
      } catch (smsErr) {
        res.status(200).json({
          success: true,
          message: process.env.NODE_ENV === 'development' ? `✅ OTP (Dev): ${otp}` : '❌ SMS failed. Try email.',
          devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
      }
    }
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Reset Password - Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ message: '❌ Phone and OTP are required!' });
    }

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: '❌ User not found!' });

    if (!user.otp) {
      return res.status(400).json({ message: '❌ No OTP requested. Please request a new OTP.' });
    }

    if (user.otpExpire < new Date()) {
      user.otp = undefined;
      user.otpExpire = undefined;
      await user.save();
      return res.status(400).json({ message: '❌ OTP expired! Please request a new one.' });
    }

    if (user.otp !== otp.toString()) {
      return res.status(400).json({ message: '❌ Invalid OTP! Please check and try again.' });
    }

    res.status(200).json({ success: true, message: '✅ OTP verified!' });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;

    if (!phone || !otp || !newPassword) {
      return res.status(400).json({ message: '❌ All fields are required!' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: '❌ Password must be at least 6 characters!' });
    }

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: '❌ User not found!' });

    if (!user.otp || user.otp !== otp.toString()) {
      return res.status(400).json({ message: '❌ Invalid OTP!' });
    }

    if (user.otpExpire < new Date()) {
      return res.status(400).json({ message: '❌ OTP expired! Please request a new one.' });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: '✅ Password reset successfully! Please login with your new password.' });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};