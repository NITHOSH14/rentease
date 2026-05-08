const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const createNotification = require('../utils/createNotification');

// @desc    Create new order
// @route   POST /orders
// @access  Private
const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { name, address, deliveryDate, items } = req.body;
    const user_id = req.user._id;

    if (!name || !address || !deliveryDate || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    let orderResults = [];

    await session.withTransaction(async () => {
      // Atomic Stock Reduction + Order Creation
      for (const item of items) {
        const qty = item.quantity || 1;
        
        // Step 1: Atomic check and decrement (within session)
        const updatedProduct = await Product.findOneAndUpdate(
          { 
            _id: item.product_id || item._id, 
            available_units: { $gte: qty } 
          },
          { $inc: { available_units: -qty } },
          { new: true, session }
        );

        if (!updatedProduct) {
          throw new Error(`Item "${item.name}" became unavailable or out of stock during processing.`);
        }

        // Step 2: Create the individual order entry
        const [order] = await Order.create([{
          user_id,
          product_id: item.product_id || item._id,
          name: item.name,
          price_per_month: item.price_per_month,
          duration: item.selected_duration || item.duration || 1,
          total_price: item.total_price || (item.price_per_month * (item.selected_duration || item.duration || 1)),
          address,
          delivery_date: deliveryDate,
          quantity: qty,
          status: 'Pending'
        }], { session });

        orderResults.push(order);
      }

      // Step 3: Trigger Notifications
      for (const order of orderResults) {
        await createNotification({
          user_id: user_id,
          title: "Order Placed",
          message: `Your order for "${order.name}" has been placed successfully`,
          type: "order"
        }, session);
      }

      // Step 4: Clear User Cart
      await Cart.findOneAndUpdate({ user_id }, { items: [] }, { session });
    });

    // If transaction finishes successfully, session is automatically committed by withTransaction
    res.status(201).json({
      success: true,
      data: orderResults
    });

  } catch (error) {
    console.error("Order Error (Transaction Aborted):", error.message);
    res.status(400).json({
      success: false,
      message: error.message.includes('unavailable') 
        ? error.message 
        : 'Failed to place order due to a system error',
      error: error.message
    });
  } finally {
    await session.endSession();
  }
};

// @desc    Get user orders
// @route   GET /orders/:user_id
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    // Only allow users to see their own orders unless admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.user_id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these orders' });
    }

    const orders = await Order.find({ user_id: req.params.user_id }).populate('product_id').sort('-created_at');
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not fetch orders',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Validation logic for status transitions
    const validTransitions = {
      'Pending': ['Approved', 'Rejected'],
      'Approved': ['Out for Delivery', 'Delivered', 'Rejected'],
      'Out for Delivery': ['Delivered', 'Rejected']
    };

    if (!validTransitions[order.status] || !validTransitions[order.status].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status transition from ${order.status} to ${status}.` 
      });
    }

    order.status = status;
    order.rejection_reason = reason || "";
    order.status_updated_at = new Date();
    await order.save();
    
    // Notify User
    await createNotification({
      user_id: order.user_id,
      title: status === 'Rejected' ? "Order Rejected" : "Order Update",
      message: status === 'Rejected' 
        ? `Your order "${order.name}" was rejected. Reason: ${reason || 'No reason provided'}`
        : `Your order "${order.name}" is now ${status}`,
      type: "order"
    });

    // If rejected, restore stock
    if (status === 'Rejected') {
      await Product.findByIdAndUpdate(
        order.product_id,
        { $inc: { available_units: (order.quantity || 1) } }
      );
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all orders (for admin)
// @route   GET /orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user_id', 'name email').sort('-created_at');
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  updateOrderStatus,
  getAllOrders
};
