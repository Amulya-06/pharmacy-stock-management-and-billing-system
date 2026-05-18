import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// ✅ Fetch all admins
router.get('/', async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select('_id username');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: "Error fetching admins" });
  }
});

// ✅ Update admin credentials
router.put('/update-credentials', async (req, res) => {
  const { id, username, password } = req.body;

  if (!id || !username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const admin = await User.findOneAndUpdate(
      { _id: id, role: 'admin' },
      { username, password },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ message: "Admin credentials updated successfully", admin });
  } catch (error) {
    res.status(500).json({ error: "Failed to update admin credentials" });
  }
});

export default router;
