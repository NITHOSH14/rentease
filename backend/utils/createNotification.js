const Notification = require('../models/Notification');

const createNotification = async ({ user_id, title, message, type }, session = null) => {
  try {
    const options = session ? { session } : {};
    await Notification.create([{
      user_id,
      title,
      message,
      type
    }], options);
  } catch (err) {
    console.log("Notification error:", err.message);
  }
};

module.exports = createNotification;
