const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser); // Register
router.post('/login', loginUser); // Login
router.get('/me', protect, getMe); // Legacy Get Profile
router.get('/profile', protect, getMe); // Get Profile
router.put('/profile', protect, updateUserProfile); // Update Profile

module.exports = router;