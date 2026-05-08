const User = require('../models/User');
const Order = require('../models/Order');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Register a new user
// @route   POST /users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Login user & get token
// @route   POST /users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    console.log("Login API hit");
    console.log("Body:", req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    console.log("User found:", user);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    console.log("Sending response...");

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id, user.role)
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server Error: Could not login user"
    });
  }
};

// @desc    Get all users with their orders
// @route   GET /users/admin/all
// @access  Private/Admin
const getAllUsersWithOrders = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    const data = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ user_id: user._id }).sort('-created_at');
        return { ...user._doc, orders };
      })
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsersWithOrders
};
