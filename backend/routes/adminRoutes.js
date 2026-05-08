const express = require('express');
const router = express.Router();

const { getAnalytics } = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/analytics', protect, isAdmin, getAnalytics);

module.exports = router;
