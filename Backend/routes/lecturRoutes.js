const express = require('express');
const router = express.Router();
const { 
    createLecture, 
    getLectures, 
    deleteLecture,
    getLecturesByFaculty 
} = require('../controllers/lecturController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('Faculty', 'Admin'), createLecture)
    .get(protect, getLectures);

router.route('/:id')
    .delete(protect, authorize('Faculty', 'Admin'), deleteLecture);

module.exports = router;