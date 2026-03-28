const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Book',
    },
    reason: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Resolved', 'Dismissed'],
        default: 'Pending',
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Report', reportSchema);
