const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');

// Generate JWT Token (Helper function)
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // User stays logged in for 30 days
    });
};

// @desc    Register new user
// @route   POST /api/users
const registerUser = async (req, res) => {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password (replaces password_hash logic)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        full_name,
        email,
        password: hashedPassword,
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            full_name: user.full_name,
            email: user.email,
            trustScore: user.trustScore,
            campusOrArea: user.campusOrArea,
            token: generateToken(user.id), // Send token immediately so they are logged in
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Authenticate a user (Login)
// @route   POST /api/users/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    // Check password (replaces password_verify logic)
    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            full_name: user.full_name,
            email: user.email,
            isAdmin: user.isAdmin,
            trustScore: user.trustScore,
            campusOrArea: user.campusOrArea,
            token: generateToken(user.id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Get user data (Me)
// @route   GET /api/users/me
const getMe = async (req, res) => {
    // req.user is set by the authMiddleware
    res.status(200).json(req.user);
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.phone = req.body.phone || user.phone;
        user.address = req.body.address || user.address;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            full_name: updatedUser.full_name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            isAdmin: updatedUser.isAdmin,
            trustScore: updatedUser.trustScore,
            campusOrArea: updatedUser.campusOrArea,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Admin: Get App Stats
// @route   GET /api/users/admin/stats
const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalActiveBooks = await Book.countDocuments({ status: 'available' });
        const totalCompletedOrders = await Order.countDocuments({ status: 'Completed' });
        res.json({ totalUsers, totalActiveBooks, totalCompletedOrders });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

// @desc    Admin: Get all users
// @route   GET /api/users
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// @desc    Admin: Toggle user ban
// @route   PUT /api/users/:id/ban
const toggleBanUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isBanned = !user.isBanned;
            await user.save();
            res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'}`, isBanned: user.isBanned });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateUserProfile,
    getAdminStats,
    getUsers,
    toggleBanUser,
};