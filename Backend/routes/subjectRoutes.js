const express = require('express');
const router = express.Router();
const { createSubject, getSubjects, assignSubjectToFaculty } = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('Admin'), createSubject)
    .get(protect, getSubjects);

router.route('/assign')
    .post(protect, authorize('Admin'), assignSubjectToFaculty);

module.exports = router;