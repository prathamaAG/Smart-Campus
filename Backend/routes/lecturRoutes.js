const express = require('express');
const router = express.Router();
const { 
    createLecture, 
    getLectures, 
    deleteLecture,
    getFacultyUpcomingLectures,
    getStudentLectures
} = require('../controllers/lecturController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Debug middleware to log all requests
router.use((req, res, next) => {
    console.log(`Lecture Route: ${req.method} ${req.originalUrl}`);
    console.log('Headers:', req.headers.authorization ? 'Token present' : 'No token');
    next();
});

router.route('/')
    .post(protect, authorize('Faculty', 'Admin'), createLecture)
    .get(protect, getLectures);

router.route('/:id')
    .delete(protect, authorize('Faculty', 'Admin'), deleteLecture);

router.route('/faculty/upcoming')
    .get(protect, authorize('Faculty'), getFacultyUpcomingLectures);

router.route('/faculty/:facultyId/upcoming')
    .get(protect, authorize('Admin', 'Faculty'), getFacultyUpcomingLectures);

router.route('/student')
    .get(protect, authorize('Student'), getStudentLectures);

module.exports = router;