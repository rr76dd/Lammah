const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// ✅ تأكد من أن المسارات تستخدم POST
router.post('/register', register);
router.post('/login', login);

module.exports = router;
