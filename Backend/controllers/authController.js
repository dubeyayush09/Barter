import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "30d",
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        creditBalance: user.creditBalance,
        avatar: user.avatar,
        skills: user.skills,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id);
    console.log(token)

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        creditBalance: user.creditBalance,
        avatar: user.avatar,
        skills: user.skills,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      skills: user.skills,
      creditBalance: user.creditBalance,
      status: user.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update user status
// @route   PUT /api/auth/status
// @access  Private
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Check if status is valid
    if (!["active", "busy", "away", "offline"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { status },
      { new: true }
    );

    res.json({
      _id: user._id,
      status: user.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default {
  register,
  login,
  getMe,
  updateStatus,
};
