const Report = require('../models/Report');
const Book = require('../models/Book');

// @desc    User: Report a book
// @route   POST /api/reports
const reportBook = async (req, res) => {
    try {
        const { book, reason } = req.body;
        const report = await Report.create({
            reporter: req.user._id,
            book,
            reason
        });
        res.status(201).json(report);
    } catch (error) { res.status(500).json({ message: 'Error submitting report' }); }
};

// @desc    Admin: Get pending reports
// @route   GET /api/reports/admin
const getPendingReports = async (req, res) => {
    try {
        const reports = await Report.find({ status: 'Pending' })
            .populate('reporter', 'full_name email')
            .populate('book', 'title author status user image')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) { res.status(500).json({ message: 'Error fetching reports' }); }
};

// @desc    Admin: Resolve report
// @route   PUT /api/reports/admin/:id/resolve
const resolveReport = async (req, res) => {
    try {
        const { deleteBook } = req.body;
        const report = await Report.findById(req.params.id);
        if (report) {
            report.status = 'Resolved';
            await report.save();

            if (deleteBook) {
                await Book.findByIdAndDelete(report.book);
            }
            res.json(report);
        } else { res.status(404).json({ message: 'Report not found' }); }
    } catch (error) { res.status(500).json({ message: 'Error resolving report' }); }
};

// @desc    Admin: Dismiss report
// @route   PUT /api/reports/admin/:id/dismiss
const dismissReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (report) {
            report.status = 'Dismissed';
            await report.save();
            res.json(report);
        } else { res.status(404).json({ message: 'Report not found' }); }
    } catch (error) { res.status(500).json({ message: 'Error dismissing report' }); }
};

module.exports = { reportBook, getPendingReports, resolveReport, dismissReport };
