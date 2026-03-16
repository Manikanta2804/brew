const mongoose = require('mongoose');

const hiringSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  age: { type: Number, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true },
  vehicleType: { type: String, enum: ['bike', 'scooter', 'bicycle', 'car'], required: true },
  vehicleNumber: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  experience: { type: String },
  photo: { type: String },
  licenseImage: { type: String },
  aadharNumber: { type: String },
  aadharImage: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HiringApplication', hiringSchema);
