const Order = require('../models/Order');
const Book = require('../models/Book');

// @desc    Create new order (Buy a book)
// @route   POST /api/orders
const addOrder = async (req, res) => {
    const { bookId } = req.body;

    // 1. Find the book and ensure it is available
    const book = await Book.findById(bookId);

    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }

    // 2. Security: Prevent buying your own book
    if (book.user.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot buy your own book' });
    }

    // 3. Status Check: Is it already sold or reserved?
    if (book.status !== 'available') {
        return res.status(400).json({ message: 'Book is no longer available' });
    }

    // 4. Create the Order
    const order = new Order({
        buyer: req.user._id,
        seller: book.user,
        book: book._id,
        bookTitle: book.title, // Snapshot
        bookPrice: book.price, // Snapshot
        totalPrice: book.price,
    });

    const createdOrder = await order.save();

    // 5. Update Book Status to 'reserved'
    book.status = 'reserved';
    await book.save();

    res.status(201).json(createdOrder);
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
const getMyOrders = async (req, res) => {
    // Find orders where the current user is the BUYER
    const orders = await Order.find({ buyer: req.user._id })
        .populate('book')   // Get current book details
        .populate('seller', 'full_name email') // Get seller details
        .sort({ createdAt: -1 });

    res.json(orders);
};

// @desc    Confirm Order (Mark as Completed)
// @route   PUT /api/orders/:id/confirm
const confirmOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        // Check if user is the buyer
        if (order.buyer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Update Order
        order.status = 'Completed';
        const updatedOrder = await order.save();

        // Update Book to 'sold'
        const book = await Book.findById(order.book);
        if (book) {
            book.status = 'sold';
            await book.save();
        }

        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Cancel Order
// @route   PUT /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        // Check if user is the buyer
        if (order.buyer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (order.status !== 'Pending') {
            return res.status(400).json({ message: 'Cannot cancel a completed order' });
        }

        // Update Order to Cancelled
        order.status = 'Cancelled';
        await order.save();

        // Release the Book back to 'available'
        const book = await Book.findById(order.book);
        if (book) {
            book.status = 'available';
            await book.save();
        }

        res.json({ message: 'Order cancelled and book is available again' });
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('buyer', 'full_name email')  // Corrected: Use 'buyer'
            .populate('seller', 'full_name email') // Corrected: Use 'seller'
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Server Error: Could not fetch orders" });
    }
};

module.exports = {
    addOrder,
    getMyOrders,
    confirmOrder,
    cancelOrder,
    getAllOrders,
};