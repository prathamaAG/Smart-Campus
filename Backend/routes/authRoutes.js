const express_auth = require('express');
const router_auth = express_auth.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router_auth.post('/register', registerUser);
router_auth.post('/login', loginUser);
router_auth.get('/profile', protect, getUserProfile);

module.exports = router_auth;