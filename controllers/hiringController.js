const HiringApplication = require('../models/HiringApplication');

exports.apply = async (req, res) => {
  try {
    const { name, phone, email, age, city, area, vehicleType, vehicleNumber, licenseNumber, experience, aadharNumber } = req.body;

    const existing = await HiringApplication.findOne({ phone });
    if (existing) return res.status(400).json({ message: '❌ Application already submitted with this phone!' });

    const appData = { name, phone, email, age, city, area, vehicleType, vehicleNumber, licenseNumber, experience, aadharNumber };
    if (req.files) {
      if (req.files.photo) appData.photo = '/uploads/' + req.files.photo[0].filename;
      if (req.files.licenseImage) appData.licenseImage = '/uploads/' + req.files.licenseImage[0].filename;
      if (req.files.aadharImage) appData.aadharImage = '/uploads/' + req.files.aadharImage[0].filename;
    }

    const application = await HiringApplication.create(appData);
    res.status(201).json({ success: true, message: '✅ Application submitted! We will contact you soon.', application });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const application = await HiringApplication.findOne({ phone: req.params.phone });
    if (!application) return res.status(404).json({ message: '❌ No application found!' });
    res.status(200).json({ success: true, application });
  } catch (err) {
    res.status(500).json({ message: '❌ Error: ' + err.message });
  }
};