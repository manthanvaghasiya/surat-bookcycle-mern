const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, replyToMessage, getMyMessages } = require('../controllers/messageController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', sendMessage); // Public (anyone can send)
router.get('/my-messages', protect, getMyMessages); // Protected (user's messages)
router.get('/', protect, admin, getMessages); // Admin only (view messages)
router.put('/:id/reply', protect, admin, replyToMessage); // Admin only (reply to messages)

module.exports = router;