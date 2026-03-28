const Book = require('../models/Book');
const fs = require('fs');
const path = require('path');

// @desc    Fetch all books (with optional Search Keyword and Location)
// @route   GET /api/books?keyword=...&location=...
const getBooks = async (req, res) => {
    // Replicates your PHP "WHERE title LIKE %search%" logic
    const keywordFilter = req.query.keyword
        ? {
              $or: [
                  { title: { $regex: req.query.keyword, $options: 'i' } }, // Case insensitive
                  { author: { $regex: req.query.keyword, $options: 'i' } },
              ],
          }
        : {};

    const locationFilter = req.query.location
        ? { locationTag: req.query.location }
        : {};

    // Find books matching keyword and location, sort by newest first
    const books = await Book.find({ ...keywordFilter, ...locationFilter })
        .populate('user', 'full_name trustScore')
        .sort({ createdAt: -1 });
    res.json(books);
};

// @desc    Fetch single book
// @route   GET /api/books/:id
const getBookById = async (req, res) => {
    const book = await Book.findById(req.params.id).populate('user', 'full_name email trustScore campusOrArea');

    if (book) {
        res.json(book);
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
};

// @desc    Create a book listing
// @route   POST /api/books
const createBook = async (req, res) => {
    // req.file is provided by Multer middleware
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload an image' });
    }

    const { title, author, genre, condition, price, description, locationTag } = req.body;

    const book = new Book({
        user: req.user._id, // Set the seller as the logged-in user
        title,
        author,
        genre,
        condition,
        price,
        description,
        locationTag,
        image: req.file.path, // Save the path: "uploads\image-123.jpg"
        status: 'available',
    });

    const createdBook = await book.save();
    res.status(201).json(createdBook);
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Crucial Logic: Authorization check (Owner OR Admin allowed)
        if (book.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(401).json({ message: 'Not authorized to delete this book' });
        }

        // Allow Admins to delete even reserved/sold books, but block normal users
        if (book.status !== 'available' && !req.user.isAdmin) {
             return res.status(400).json({ message: 'Cannot delete a book that is reserved or sold' });
        }

        // Delete the physical image file
        if (book.image) {
            const imagePath = path.resolve(book.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Crucial Logic: Proceed to deletion
        await Book.findByIdAndDelete(req.params.id);
        res.json({ message: 'Book removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during deletion' });
    }
};

// @desc    Get user's own books (Dashboard)
// @route   GET /api/books/mybooks
const getMyBooks = async (req, res) => {
    const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(books);
};

// @desc    Update a book
// @route   PUT /api/books/:id
const updateBook = async (req, res) => {
    const book = await Book.findById(req.params.id);

    if (book) {
        // 1. Check if the user owns this book
        if (book.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(401).json({ message: 'Not authorized to edit this book' });
        }

        // 2. Update text fields
        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author;
        book.genre = req.body.genre || book.genre;
        book.condition = req.body.condition || book.condition;
        book.price = req.body.price || book.price;
        book.description = req.body.description || book.description;
        book.locationTag = req.body.locationTag || book.locationTag;

        // 3. If a NEW image is uploaded, update it. Otherwise, keep the old one.
        if (req.file) {
             // Delete the old file using fs.unlinkSync to save space (Memory Leak Fix)
             if (book.image) {
                 const imagePath = path.resolve(book.image);
                 if (fs.existsSync(imagePath)) {
                     fs.unlinkSync(imagePath);
                 }
             }
             book.image = req.file.path;
        }

        const updatedBook = await book.save();
        res.json(updatedBook);
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
};

module.exports = {
    getBooks,
    getBookById,
    createBook,
    deleteBook,
    getMyBooks,
    updateBook,
};