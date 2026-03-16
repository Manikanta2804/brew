const express = require('express');
const router = express.Router();
const { apply, getStatus } = require('../controllers/hiringController');
const { uploadFields } = require('../middleware/upload');

router.post('/apply', uploadFields, apply);
router.get('/status/:phone', getStatus);

module.exports = router;