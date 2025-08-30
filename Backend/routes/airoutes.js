const express_ai = require('express');
const router_ai = express_ai.Router();
const { getAIChatResponse } = require('../controllers/aicontroller');
const { protect } = require('../middleware/authMiddleware');

// Protect the route to ensure only logged-in users can use the AI chat
router_ai.post('/chat', protect, getAIChatResponse);

module.exports = router_ai;

// --- Other backend files remain the same ---