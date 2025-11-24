const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser); // Register
router.post('/login', loginUser); // Login
router.get('/me', protect, getMe); // Get Profile (Protected Route)

module.exports = router;