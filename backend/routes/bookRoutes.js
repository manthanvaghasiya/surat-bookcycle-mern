const express = require('express');
const router = express.Router();
const {
    getBooks,
    getBookById,
    createBook,
    deleteBook,
    getMyBooks,
    updateBook,
    createBookReview
} = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public Routes (Anyone can see books)
router.get('/', getBooks);

// Protected Routes (Must be logged in)
router.get('/mybooks', protect, getMyBooks); // For Dashboard
router.get('/:id', getBookById); // Details page
router.post('/', protect, upload.single('image'), createBook); // List a book (with image)
router.delete('/:id', protect, deleteBook); // Delete a book
router.put('/:id', protect, upload.single('image'), updateBook);
router.post('/:id/reviews', protect, createBookReview);

module.exports = router;