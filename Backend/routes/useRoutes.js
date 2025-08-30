const userRouter = require('express').Router();
const { getUsers, getFaculty, getStudents, updateUserProfile, updateFacultySubjects, updateUser, getMe } = require('../controllers/useController'); 
const { protect: protectUser, authorize } = require('../middleware/authMiddleware');

userRouter.route('/announcement').post(protectUser, authorize('Admin'), (req, res) => {
    // This is a placeholder. In a real application, you would implement
    // a notification system (e.g., WebSockets, push notifications)
    // to send this announcement to all users.
    console.log('Announcement received:', req.body);
    res.status(200).json({ success: true, message: 'Announcement sent.' });
});

userRouter.route('/').get(protectUser, authorize('Admin'), getUsers);
userRouter.route('/faculty').get(protectUser, authorize('Admin'), getFaculty);
userRouter.route('/students').get(protectUser, authorize('Admin'), getStudents);
userRouter.route('/profile').put(protectUser, updateUserProfile);
userRouter.route('/:id').patch(protectUser, authorize('Admin'), updateUser);
userRouter.route('/me').get(protectUser, getMe);

// Add the new route for updating subjects
userRouter.route('/faculty/:id/subjects').put(protectUser, authorize('Admin'), updateFacultySubjects);

module.exports = userRouter;