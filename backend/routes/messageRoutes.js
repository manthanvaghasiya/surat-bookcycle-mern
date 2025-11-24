const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', sendMessage); // Public (anyone can send)
router.get('/', protect, admin, getMessages); // Admin only (view messages)

module.exports = router;