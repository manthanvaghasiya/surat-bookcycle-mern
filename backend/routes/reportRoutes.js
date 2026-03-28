const express = require('express');
const router = express.Router();
const { reportBook, getPendingReports, resolveReport, dismissReport } = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, reportBook);
router.get('/admin', protect, admin, getPendingReports);
router.put('/admin/:id/resolve', protect, admin, resolveReport);
router.put('/admin/:id/dismiss', protect, admin, dismissReport);

module.exports = router;
