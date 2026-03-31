const Message = require('../models/Message');
const jwt = require('jsonwebtoken');

// @desc    Send a message
// @route   POST /api/messages
const sendMessage = async (req, res) => {
    const { name, email, subject, message } = req.body;

    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
        } catch (error) {
            // Ignore invalid token, just don't link user
        }
    }

    const newMessage = await Message.create({
        name,
        email,
        subject,
        message,
        user: userId,
        conversation: [{ sender: 'User', text: message }],
        adminHasUnread: true,
        status: 'Open'
    });

    res.status(201).json(newMessage);
};

// @desc    Get all messages (Admin only)
// @route   GET /api/messages
const getMessages = async (req, res) => {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.json(messages);
};

// @desc    Reply to a message (Admin only)
// @route   PUT /api/messages/:id/reply
const replyToMessage = async (req, res) => {
    const { replyText } = req.body;
    
    if (!replyText) {
        return res.status(400).json({ message: 'Reply text is required' });
    }

    const message = await Message.findById(req.params.id);

    if (message) {
        if (message.status === 'Resolved') {
            return res.status(400).json({ message: 'Cannot reply to a resolved ticket' });
        }
        
        message.conversation.push({ sender: 'Admin', text: replyText });
        message.status = 'Awaiting User';
        message.userHasUnread = true;
        message.adminHasUnread = false; // Admin replied, so they have read it

        const updatedMessage = await message.save();
        res.json(updatedMessage);
    } else {
        res.status(404).json({ message: 'Message not found' });
    }
};

// @desc    User reply to a message
// @route   PUT /api/messages/:id/user-reply
const userReplyToMessage = async (req, res) => {
    const { replyText } = req.body;
    
    if (!replyText) {
        return res.status(400).json({ message: 'Reply text is required' });
    }

    const message = await Message.findById(req.params.id);

    if (message) {
        // Ensure the logged in user owns the message
        if (message.user && message.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        
        if (message.status === 'Resolved') {
            return res.status(400).json({ message: 'Cannot reply to a resolved ticket' });
        }

        message.conversation.push({ sender: 'User', text: replyText });
        message.status = 'Open';
        message.adminHasUnread = true;
        message.userHasUnread = false; // They just replied, they've read it

        const updatedMessage = await message.save();
        res.json(updatedMessage);
    } else {
        res.status(404).json({ message: 'Message not found' });
    }
};

// @desc    Mark a message as resolved (Admin only)
// @route   PUT /api/messages/:id/resolve
const resolveMessage = async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (message) {
        message.status = 'Resolved';
        message.adminHasUnread = false; // Mark read so it doesn't bother admin
        // We do NOT set userHasUnread to false so if they had an unread message, it stays unread until they view it
        const updatedMessage = await message.save();
        res.json(updatedMessage);
    } else {
        res.status(404).json({ message: 'Message not found' });
    }
};

// @desc    Get logged in user's messages
// @route   GET /api/messages/my-messages
const getMyMessages = async (req, res) => {
    const messages = await Message.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(messages);
};

// @desc    Mark all user messages as read
// @route   PUT /api/messages/mark-read
const markAsRead = async (req, res) => {
    await Message.updateMany(
        { user: req.user._id, userHasUnread: true },
        { $set: { userHasUnread: false } }
    );
    res.json({ message: 'Messages marked as read' });
};

// @desc    Mark admin messages as read individually
// @route   PUT /api/messages/admin-mark-read/:id
const adminMarkRead = async (req, res) => {
    const message = await Message.findById(req.params.id);
    if(message) {
        message.adminHasUnread = false;
        await message.save();
        res.json(message);
    } else {
        res.status(404).json({ message: 'Message not found' });
    }
};

// @desc    Get Unread Count for User
// @route   GET /api/messages/unread-count
const getUnreadCount = async (req, res) => {
    const count = await Message.countDocuments({ user: req.user._id, userHasUnread: true });
    res.json({ count });
};

module.exports = { 
    sendMessage, 
    getMessages, 
    replyToMessage, 
    userReplyToMessage, 
    resolveMessage, 
    getMyMessages, 
    markAsRead, 
    getUnreadCount,
    adminMarkRead
};