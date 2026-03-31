    const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    conversation: [
        {
            sender: { type: String, enum: ['User', 'Admin'], required: true },
            text: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    userHasUnread: { type: Boolean, default: false },
    adminHasUnread: { type: Boolean, default: true },
    status: { type: String, enum: ['Open', 'Awaiting User', 'Resolved'], default: 'Open' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
}, {
    timestamps: true // Matches 'sent_at'
});

module.exports = mongoose.model('Message', messageSchema);