import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { User } from '../models/User.js';

// Generate JWT tokens
const makeAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });

const makeRefreshToken = (user) =>
  jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

// ---------------- REGISTER ----------------
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation error', details: errors.array() });
    }

    const { name, role, email, password } = req.body;

    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const user = await User.create({ name, role, email, password });

    // Generate tokens
    const token = makeAccessToken(user);
    const refreshToken = makeRefreshToken(user);

    res.status(201).json({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      token,
      refreshToken,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------- LOGIN ----------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = makeAccessToken(user);
    const refreshToken = makeRefreshToken(user);

    res.json({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      token,
      refreshToken,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------- GET CURRENT USER ----------------
export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
