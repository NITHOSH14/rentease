const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Route mapping
router.route('/')
  .get(getProducts)
  .post(protect, isAdmin, addProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, isAdmin, updateProduct)
  .delete(protect, isAdmin, deleteProduct);

module.exports = router;
