const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
    submitAssignment, 
    gradeSubmission, 
    getFacultySubmissions, 
    downloadSubmission 
} = require('../controllers/submissionController');

// Configure multer for submission uploads - DOCX ONLY
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/submissions/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Force .docx extension
        cb(null, 'submission-' + uniqueSuffix + '.docx');
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        console.log('Submission upload attempt:', file.originalname, file.mimetype);
        
        // Strictly allow only DOCX files
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(new Error('Only .docx files are allowed. Please upload .docx format only.'), false);
        }
    }
});

// Student routes
router.post('/assignments/:id/submit', protect, authorize('Student'), upload.single('file'), submitAssignment);

// Faculty routes
router.get('/faculty/submissions', protect, authorize('Faculty'), getFacultySubmissions);
router.put('/assignments/:assignmentId/submissions/:submissionId/grade', protect, authorize('Faculty'), gradeSubmission);
router.get('/download/:assignmentId/:submissionId', protect, authorize('Faculty'), downloadSubmission);

module.exports = router;