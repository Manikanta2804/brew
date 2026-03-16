const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('❌ Images only! (jpeg, jpg, png, webp)'));
  }
};

exports.uploadSingle = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
}).single('image');

exports.uploadMultiple = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
}).array('images', 5);

exports.uploadFields = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'licenseImage', maxCount: 1 },
  { name: 'aadharImage', maxCount: 1 },
  { name: 'shopImage', maxCount: 1 },
  { name: 'images', maxCount: 5 }
]);
