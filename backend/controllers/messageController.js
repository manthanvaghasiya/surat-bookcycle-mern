const Message = require('../models/Message');

// @desc    Send a message
// @route   POST /api/messages
const sendMessage = async (req, res) => {
    const { name, email, subject, message } = req.body;

    const newMessage = await Message.create({
        name,
        email,
        subject,
        message,
    });

    res.status(201).json(newMessage);
};

// @desc    Get all messages (Admin only)
// @route   GET /api/messages
const getMessages = async (req, res) => {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.json(messages);
};

module.exports = { sendMessage, getMessages };