const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateUserProfile, getAdminStats, getUsers, toggleBanUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', registerUser); // Register
router.post('/login', loginUser); // Login
router.get('/me', protect, getMe); // Legacy Get Profile
router.get('/profile', protect, getMe); // Get Profile
router.put('/profile', protect, updateUserProfile); // Update Profile

router.get('/', protect, admin, getUsers); // Admin Get Users
router.get('/admin/stats', protect, admin, getAdminStats); // Admin Stats
router.put('/:id/ban', protect, admin, toggleBanUser); // Admin Toggle Ban

module.exports = router;