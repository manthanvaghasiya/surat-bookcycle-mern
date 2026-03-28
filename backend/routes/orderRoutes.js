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
    adminOverrideOrder,
    exportOrdersCSV,
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

// Admin Action Routes
router.get('/export/csv', protect, admin, exportOrdersCSV);
router.put('/:id/admin-override', protect, admin, adminOverrideOrder);

module.exports = router;