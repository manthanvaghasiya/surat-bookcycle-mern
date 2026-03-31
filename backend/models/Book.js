const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
        required: false,
    }
}, {
    timestamps: true
});

const bookSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Links to the Seller
    },
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    genre: {
        type: String,
        required: false,
    },
    condition: {
        type: String,
        required: true,
        enum: ['Like New', 'Good', 'Acceptable'],
    },
    price: {
        type: Number,
        required: true,
        default: 0.0,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true, // Stores the filename/path
    },
    locationTag: {
        type: String,
        required: true,
        default: 'Surat', // Default added to fix ValidationErrors on old books
    },
    status: {
        type: String,
        required: true,
        default: 'available',
        enum: ['available', 'reserved', 'sold'], // Matches your buying logic
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 0,
    },
    reviews: [reviewSchema],
    rating: {
        type: Number,
        required: true,
        default: 0,
    },
    numReviews: {
        type: Number,
        required: true,
        default: 0,
    }
}, {
    timestamps: true // Matches 'listed_at'
});

module.exports = mongoose.model('Book', bookSchema);