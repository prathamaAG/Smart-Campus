const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all activities
// @route   GET /api/activities
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 }).limit(10);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
