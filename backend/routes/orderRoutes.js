const express = require('express');
const router = express.Router();
const {
    addOrder,
    getMyOrders,
    getIncomingOrders,
    sellerDecision,
    mutualConfirm,
    cancelOrder,
    getAllOrders,
} = require('../controllers/orderController');

// FIX IS HERE: We added 'admin' to the import
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, addOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/incoming', protect, getIncomingOrders);

// This line caused the error because 'admin' wasn't imported before
router.get('/', protect, admin, getAllOrders);

router.put('/:id/decision', protect, sellerDecision);
router.put('/:id/mutual-confirm', protect, mutualConfirm);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;