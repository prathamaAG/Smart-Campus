const express = require('express');
const router = express.Router();
const { createAssignment, getAssignments } = require('../controllers/assginmentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

router.route('/')
    .post(protect, authorize('Faculty'), upload.single('file'), createAssignment)
    .get(protect, getAssignments);

module.exports = router;