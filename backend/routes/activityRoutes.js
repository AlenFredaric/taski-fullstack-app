// backend/routes/activityRoutes.js
const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { protect } = require('../middlewares/authMiddleware');

// Get all logs for logged-in user
router.get('/stream', protect, async (req, res) => {
  try {
    const logs = await Activity.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;