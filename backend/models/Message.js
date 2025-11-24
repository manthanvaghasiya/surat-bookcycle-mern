    const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
}, {
    timestamps: true // Matches 'sent_at'
});

module.exports = mongoose.model('Message', messageSchema);