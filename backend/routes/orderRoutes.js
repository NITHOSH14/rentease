const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  updateOrderStatus,
  getAllOrders
} = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, isAdmin, getAllOrders)
  .post(protect, createOrder);

router.route('/:user_id')
  .get(protect, getUserOrders);

router.route('/:id/status')
  .put(protect, isAdmin, updateOrderStatus);

module.exports = router;
