const cron = require('node-cron');
const Order = require('../models/Order');
const createNotification = require('../utils/createNotification');

// Run every minute to check and update order statuses automatically
cron.schedule('*/1 * * * *', async () => {
  try {
    // Only fetch orders that aren't Delivered or Rejected
    const orders = await Order.find({ 
      status: { $nin: ['Delivered', 'Rejected'] } 
    });

    for (let order of orders) {
      // timeDiff in seconds
      const timeDiff = (Date.now() - new Date(order.status_updated_at || order.created_at)) / 1000;

      if (order.status === 'Pending' && timeDiff > 60) {
        order.status = 'Approved';
        order.status_updated_at = new Date();
        await order.save();
        await createNotification({
          user_id: order.user_id,
          title: "Order Approved",
          message: `✅ Your order for "${order.name}" has been Approved!`,
          type: "order"
        });
        console.log(`Order ${order._id} auto-progressed to Approved`);
      }
      else if (order.status === 'Approved' && timeDiff > 60) {
        order.status = 'Out for Delivery';
        order.status_updated_at = new Date();
        await order.save();
        await createNotification({
          user_id: order.user_id,
          title: "Order Update",
          message: `🚚 Your order for "${order.name}" is now Out for Delivery!`,
          type: "order"
        });
        console.log(`Order ${order._id} auto-progressed to Out for Delivery`);
      }
      else if (order.status === 'Out for Delivery' && timeDiff > 60) {
        order.status = 'Delivered';
        order.status_updated_at = new Date();
        await order.save();
        await createNotification({
          user_id: order.user_id,
          title: "Order Delivered",
          message: `🎉 Your order for "${order.name}" has been Delivered!`,
          type: "order"
        });
        console.log(`Order ${order._id} auto-progressed to Delivered`);
      }
    }
  } catch (error) {
    console.error("❌ Cron Job Error updating orders:", error.message);
  }
});
