import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const user = new User({ username, password, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Added hardcoded bypass so you can log in without DB credentials
  if (username === 'admin' && password === 'admin') {
    return res.json({ message: 'Login successful', role: 'admin', token: 'mock-token' });
  }

  try {
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful', role: user.role });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;