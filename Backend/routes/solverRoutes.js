const express = require('express');
const router = express.Router();
const multer = require('multer');
const { processAssignment, downloadAssignment } = require('../controllers/solverController');
const { protect } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
    // Temporarily removing file filter for testing
    // fileFilter: (req, file, cb) => {
    //     if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    //         file.mimetype === 'application/msword') {
    //         cb(null, true);
    //     } else {
    //         cb(new Error('Only .doc and .docx files are allowed!'), false);
    //     }
    // }
});

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Solver routes working' });
});

// Test file upload
router.post('/test-upload', upload.single('file'), (req, res) => {
    console.log('=== TEST UPLOAD ===');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    res.json({ 
        body: req.body, 
        file: req.file ? { name: req.file.originalname, size: req.file.size } : null 
    });
});

// Route for uploading and processing assignment
router.post('/upload', protect, upload.single('file'), processAssignment);

// Route for downloading processed assignment - This is now handled by static serving in server.js
// router.get('/download/:filename', protect, downloadAssignment);

module.exports = router;
