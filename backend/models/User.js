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
    isAdmin: {
        type: Boolean,
        required: true,
        default: false, // Default is normal user, logic handles Admin login
    }
}, {
    timestamps: true // Automatically creates 'created_at' and 'updated_at'
});

module.exports = mongoose.model('User', userSchema);