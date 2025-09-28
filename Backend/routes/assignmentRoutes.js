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
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'assignment-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow common document types
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'), false);
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