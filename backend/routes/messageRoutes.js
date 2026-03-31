const express = require('express');
const router = express.Router();
const { 
    sendMessage, 
    getMessages, 
    replyToMessage, 
    getMyMessages,
    userReplyToMessage,
    markAsRead,
    getUnreadCount,
    resolveMessage,
    adminMarkRead
} = require('../controllers/messageController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', sendMessage); // Public (anyone can send)

// Protected (User endpoints)
router.get('/my-messages', protect, getMyMessages);
router.get('/unread-count', protect, getUnreadCount);
router.put('/mark-read', protect, markAsRead);
router.put('/:id/user-reply', protect, userReplyToMessage);

// Admin-only endpoints
router.get('/', protect, admin, getMessages); 
router.put('/:id/reply', protect, admin, replyToMessage); 
router.put('/:id/resolve', protect, admin, resolveMessage);
router.put('/admin-mark-read/:id', protect, admin, adminMarkRead);

module.exports = router;