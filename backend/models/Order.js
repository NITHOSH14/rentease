const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Order must successfully be bound toward specific user']
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  name: {
    type: String,
    required: [true, 'Product name is required']
  },
  price_per_month: {
    type: Number,
    required: [true, 'Price per month is required']
  },
  duration: {
    type: Number,
    required: [true, 'Duration in months is required'],
    min: [1, 'Minimum duration is 1 month']
  },
  total_price: {
    type: Number,
    required: [true, 'Total price is required']
  },
  address: {
    type: String,
    required: [true, 'Delivery address is required']
  },
  delivery_date: {
    type: Date,
    required: [true, 'Delivery date is required']
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Out for Delivery', 'Delivered', 'Rejected'],
    default: 'Pending'
  },
  status_updated_at: {
    type: Date,
    default: Date.now
  },
  rejection_reason: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
