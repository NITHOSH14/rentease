const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueData = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total_price" } } }
    ]);

    const activeRentals = await Order.countDocuments({ status: "Approved" });

    const topProducts = await Order.aggregate([
      {
        $group: {
          _id: "$product_id",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalRevenue: revenueData[0]?.total || 0,
        activeRentals,
        topProducts
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAnalytics };
