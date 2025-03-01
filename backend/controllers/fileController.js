const express = require('express');
const router = express.Router();

// مسار اختبار
router.get('/test', (req, res) => {
    res.json({ message: '📄 File API is working!' });
});

module.exports = router;
