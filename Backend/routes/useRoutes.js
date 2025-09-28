const userRouter = require('express').Router();
const { getUsers, getFaculty, getStudents, updateUserProfile, updateFacultySubjects, updateUser, getMe, deleteUser } = require('../controllers/useController'); 
const { protect: protectUser, authorize } = require('../middleware/authMiddleware');

// Debug middleware
userRouter.use((req, res, next) => {
    console.log(`User Route: ${req.method} ${req.originalUrl}`);
    next();
});

userRouter.route('/announcement').post(protectUser, authorize('Admin'), (req, res) => {
    console.log('Announcement received:', req.body);
    res.status(200).json({ success: true, message: 'Announcement sent.' });
});

userRouter.route('/').get(protectUser, authorize('Admin'), getUsers);
userRouter.route('/faculty').get(protectUser, authorize('Admin'), getFaculty);
userRouter.route('/students').get(protectUser, authorize('Admin'), getStudents);
userRouter.route('/profile').put(protectUser, updateUserProfile);
userRouter.route('/me').get(protectUser, getMe);

// Faculty-specific route BEFORE generic /:id route
userRouter.route('/faculty/:id/subjects').put(protectUser, authorize('Admin'), updateFacultySubjects);

// Generic /:id routes - ORDER MATTERS!
userRouter.route('/:id')
    .patch(protectUser, authorize('Admin'), updateUser)
    .delete(protectUser, authorize('Admin'), deleteUser);

module.exports = userRouter;