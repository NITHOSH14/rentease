const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: String,
  message: String,
  type: {
    type: String,
    enum: ['order', 'payment', 'system', 'admin'],
    default: 'system'
  },
  is_read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
