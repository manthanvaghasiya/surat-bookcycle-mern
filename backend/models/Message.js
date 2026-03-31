    const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    adminReply: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Replied'], default: 'Pending' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
}, {
    timestamps: true // Matches 'sent_at'
});

module.exports = mongoose.model('Message', messageSchema);