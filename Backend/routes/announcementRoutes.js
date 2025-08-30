const express = require('express');
const router = express.Router();
const { createAnnouncement, getAnnouncements } = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Route to create an announcement (Admin only)
router.post('/', protect, authorize('Admin'), createAnnouncement);

// Route to get all announcements (All authenticated users)
router.get('/', protect, getAnnouncements);

module.exports = router;
