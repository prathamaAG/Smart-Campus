const Announcement = require('../models/Announcement');

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private/Admin
const createAnnouncement = async (req, res) => {
    const { title, message } = req.body;

    try {
        const announcement = new Announcement({
            title,
            message,
            author: req.user.id,
        });

        await announcement.save();
        res.status(201).json(announcement);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 }).populate('author', 'name');
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createAnnouncement,
    getAnnouncements,
};
