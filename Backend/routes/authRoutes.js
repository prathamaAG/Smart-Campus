const express_auth = require('express');
const router_auth = express_auth.Router();
const { registerUser, authUser, getUserProfile } = require('../controllers/authController'); // Changed loginUser to authUser
const { protect } = require('../middleware/authMiddleware');

router_auth.post('/register', registerUser);
router_auth.post('/login', authUser); // Changed loginUser to authUser
router_auth.get('/profile', protect, getUserProfile);

module.exports = router_auth;