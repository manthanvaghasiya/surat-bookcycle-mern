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
    
    // Validate
    if (!replyText) {
        return res.status(400).json({ message: 'Reply text is required' });
    }

    const message = await Message.findById(req.params.id);

    if (message) {
        message.adminReply = replyText;
        message.status = 'Replied';

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

module.exports = { sendMessage, getMessages, replyToMessage, getMyMessages };