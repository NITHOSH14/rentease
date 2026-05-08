const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user._id });
    res.status(200).json({ success: true, data: cart || { items: [] } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { product } = req.body;
    const productId = product.product_id || product._id;

    // Check stock before adding
    const dbProduct = await Product.findById(productId);
    if (!dbProduct || dbProduct.available_units <= 0) {
      return res.status(400).json({ success: false, message: "Out of stock" });
    }

    let cart = await Cart.findOne({ user_id: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user_id: req.user._id, items: [] });
    }

    const exists = cart.items.find(item => item.product_id.toString() === productId);

    if (exists) {
      return res.status(400).json({ success: false, message: "Item already in cart" });
    }

    cart.items.push({
      product_id: productId,
      name: product.name,
      price_per_month: product.price_per_month,
      selected_duration: product.selected_duration || product.duration || 1,
      total_price: product.total_price || (product.price_per_month * (product.selected_duration || product.duration || 1)),
      image: product.image,
      quantity: product.quantity || 1,
      deposit: product.deposit || 0
    });

    await cart.save();
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /cart/:id
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await Cart.findOne({ user_id: req.user._id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(item => item.product_id.toString() !== id);

    await cart.save();
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ success: true, message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCart, addToCart, removeFromCart, clearCart };
