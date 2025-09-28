const express = require('express');
const router = express.Router();
const multer = require('multer');
const { processAssignment, downloadAssignment } = require('../controllers/solverController');
const { protect } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.mimetype === 'application/msword') {
            cb(null, true);
        } else {
            cb(new Error('Only Word documents are allowed'));
        }
    }
});

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Solver routes working' });
});

// Route for uploading and processing assignment
router.post('/process', protect, upload.single('file'), processAssignment);

// Route for downloading processed assignment
router.get('/download/:filename', protect, downloadAssignment);

module.exports = router;
