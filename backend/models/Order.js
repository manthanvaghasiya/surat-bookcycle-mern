const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Book',
    },
    // Snapshot fields (in case book is deleted/changed later)
    bookTitle: { type: String, required: true },
    bookPrice: { type: Number, required: true },
    
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    status: {
        type: String,
        required: true,
        default: 'Pending',
        enum: ['Pending', 'Completed', 'Cancelled'], // Matches your PHP status
    }
}, {
    timestamps: true // Matches 'order_date'
});

module.exports = mongoose.model('Order', orderSchema);