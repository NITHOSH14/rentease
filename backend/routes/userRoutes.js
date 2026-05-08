const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getAllUsersWithOrders,
} = require('../controllers/userController');

const { protect, isAdmin } = require('../middleware/authMiddleware');

// Debug check
console.log("getAllUsersWithOrders:", getAllUsersWithOrders);
console.log("isAdmin:", isAdmin);

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/admin/all', protect, isAdmin, getAllUsersWithOrders);

module.exports = router;
