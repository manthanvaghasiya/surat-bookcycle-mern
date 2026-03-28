const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    full_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    address: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false, // Default is normal user, logic handles Admin login
    },
    trustScore: {
        type: Number,
        default: 0,
    },
    campusOrArea: {
        type: String,
        required: false,
    }
}, {
    timestamps: true // Automatically creates 'created_at' and 'updated_at'
});

module.exports = mongoose.model('User', userSchema);