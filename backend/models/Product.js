const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: {
      values: ['Furniture', 'Appliances', 'Electronics', 'Fitness', 'Packages'],
      message: 'Category must be Furniture, Appliances, Electronics, Fitness, or Packages'
    }
  },
  price_per_month: {
    type: Number,
    required: [true, 'Please provide a monthly rental price'],
    min: [0, 'Price cannot be negative']
  },
  deposit: {
    type: Number,
    required: [true, 'Please provide a deposit amount'],
    min: [0, 'Deposit cannot be negative']
  },
  image: {
    type: String,
    required: [true, 'Please provide an image URL']
  },
  available_units: {
    type: Number,
    required: true,
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
