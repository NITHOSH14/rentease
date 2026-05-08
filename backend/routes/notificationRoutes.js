const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markOneAsRead,
  markAllAsRead,
  deleteAllNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markOneAsRead);
router.delete('/', protect, deleteAllNotifications);

module.exports = router;
