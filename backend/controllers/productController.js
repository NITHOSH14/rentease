const Product = require('../models/Product');

const getProducts = async (req, res) => {
  try {
    const { search, category, min, max, page, limit } = req.query;

    let query = {};

    // Case-insensitive text search on name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Case-insensitive exact category match
    if (category && category !== 'All' && category !== '') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Price range filtering
    if (min || max) {
      query.price_per_month = {
        ...(min && { $gte: Number(min) }),
        ...(max && { $lte: Number(max) })
      };
    }

    // Pagination / Limit logic
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 0; // 0 returns all in Mongoose find().limit(0)
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(query)
      .skip(skip)
      .limit(limitNum);

    const totalCount = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      total: totalCount,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('❌ getProducts error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not fetch products',
      error: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    // Handling invalid ObjectID errors
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: `Product not found with id of ${req.params.id}`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not fetch product',
      error: error.message
    });
  }
};

// @desc    Add a product
// @route   POST /products
// @access  Public (Should be private/admin in production)
const addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error: Could not add product',
      error: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /products/:id
// @access  Public (Should be private/admin in production)
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id of ${req.params.id}`
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: `Product not found with id of ${req.params.id}`
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not update product',
      error: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /products/:id
// @access  Public (Should be private/admin in production)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id of ${req.params.id}`
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: `Product not found with id of ${req.params.id}`
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not delete product',
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
};
