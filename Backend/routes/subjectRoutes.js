const express = require('express');
const router = express.Router();
const { 
    createSubject, 
    getSubjects, 
    assignSubjectToFaculty, 
    updateSubject, 
    deleteSubject,
    removeFacultyFromSubject 
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Debug middleware
router.use((req, res, next) => {
    console.log(`Subject Route: ${req.method} ${req.originalUrl}`);
    next();
});

router.route('/')
    .post(protect, authorize('Admin'), createSubject)
    .get(protect, getSubjects);

router.route('/assign')
    .post(protect, authorize('Admin'), assignSubjectToFaculty);

router.route('/remove-faculty')
    .post(protect, authorize('Admin'), removeFacultyFromSubject);

router.route('/:id')
    .put(protect, authorize('Admin'), updateSubject)
    .delete(protect, authorize('Admin'), deleteSubject);

module.exports = router;