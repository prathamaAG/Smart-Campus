const express = require('express');
const router = express.Router();
const { createAssignment, getAssignments, getAssignment, deleteAssignment, downloadAssignmentFile } = require('../controllers/assginmentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp, force .docx extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'assignment-' + uniqueSuffix + '.docx');
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log('File upload attempt:', file.originalname, file.mimetype);
        
        // Strictly allow only DOCX files
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(new Error('Only .docx files are allowed'), false);
        }
    }
});

router.route('/')
    .post(protect, authorize('Faculty'), upload.single('file'), createAssignment)
    .get(protect, getAssignments);

router.route('/:id')
    .get(protect, getAssignment)
    .delete(protect, authorize('Faculty'), deleteAssignment);

// Add download route
router.route('/download/:id')
    .get(protect, downloadAssignmentFile);

module.exports = router;