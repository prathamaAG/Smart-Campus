const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const announcements = await Announcement.find({})
            .sort({ createdAt: -1 });
        res.json(announcements);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private/Admin
router.post('/', protect, authorize('Admin'), async (req, res) => {
    try {
        const { title, message } = req.body;
        const announcement = new Announcement({
            title,
            message,
            author: req.user.id
        });
        const savedAnnouncement = await announcement.save();
        res.status(201).json(savedAnnouncement);
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
    try {
        const { title, message } = req.body;
        const announcement = await Announcement.findById(req.params.id);
        
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }
        
        announcement.title = title || announcement.title;
        announcement.message = message || announcement.message;
        
        const updatedAnnouncement = await announcement.save();
        res.json(updatedAnnouncement);
    } catch (error) {
        console.error('Error updating announcement:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }
        
        await announcement.deleteOne();
        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
