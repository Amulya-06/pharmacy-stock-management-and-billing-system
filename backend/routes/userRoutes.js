import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// ✅ Fetch all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select('_id username');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

// ✅ Update user credentials
router.put('/update-credentials', async (req, res) => {
  const { id, username, password } = req.body;

  if (!id || !username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOneAndUpdate(
      { _id: id, role: 'user' },
      { username, password },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User credentials updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user credentials" });
  }
});

export default router;
