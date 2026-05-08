const Notification = require('../models/Notification');

// @desc    Get user notifications (today only, sorted newest first)
// @route   GET /notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Auto-clean yesterday's notifications
    await Notification.deleteMany({ user_id: req.user._id, createdAt: { $lt: today } });

    const notifications = await Notification.find({
      user_id: req.user._id,
      createdAt: { $gte: today }
    }).sort('-createdAt');

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Mark a single notification as read
// @route   PUT /notifications/:id/read
// @access  Private
const markOneAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { is_read: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Mark all user notifications as read
// @route   PUT /notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user._id, is_read: false },
      { $set: { is_read: true } }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete all notifications for user
// @route   DELETE /notifications
// @access  Private
const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user_id: req.user._id });
    res.status(200).json({ success: true, message: 'All notifications deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Auto-clean notifications older than today (utility, called on fetch)
// @route   N/A — internal helper triggered by GET /notifications
const cleanOldNotifications = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await Notification.deleteMany({ user_id: userId, createdAt: { $lt: today } });
  } catch (_) {}
};

module.exports = { getNotifications, markOneAsRead, markAllAsRead, deleteAllNotifications, cleanOldNotifications };
