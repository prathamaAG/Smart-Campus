const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Activity = require('../models/Activity');

// @desc    Get all activities
// @route   GET /api/activities
// @access  Private/Admin
router.get('/', protect, authorize('Admin'), async (req, res) => {
    try {
        const activities = await Activity.find({})
            .populate('user', 'name email role')
            .sort({ timestamp: -1 })
            .limit(50);
        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
