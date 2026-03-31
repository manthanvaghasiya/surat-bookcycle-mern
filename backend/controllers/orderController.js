const Order = require('../models/Order');
const Book = require('../models/Book');
const User = require('../models/User');

// @desc    Create new order (Buy a book)
// @route   POST /api/orders
const addOrder = async (req, res) => {
    // ENFORCEMENT: Ensure user has phone and address
    if (!req.user.phone || !req.user.address) {
        return res.status(400).json({ message: "Please update your phone number and address in your profile before buying." });
    }

    const { bookId, quantity } = req.body;

    const requestedQuantity = quantity || 1;

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
    if (book.status !== 'available' && book.quantity <= 0) {
        // We only block if there's no quantity left
        return res.status(400).json({ message: 'Book is no longer available' });
    }

    // Validation: Check if requested quantity exceeds book quantity
    if (book.quantity < requestedQuantity) {
        return res.status(400).json({ message: `Only ${book.quantity} copies left` });
    }

    // 4. Create the Order
    const order = new Order({
        buyer: req.user._id,
        seller: book.user,
        book: book._id,
        bookTitle: book.title, // Snapshot
        bookPrice: book.price, // Snapshot
        totalPrice: book.price * requestedQuantity,
        quantity: requestedQuantity,
    });

    const createdOrder = await order.save();

    // 5. Update Book Quantity and Status
    book.quantity -= requestedQuantity;
    if (book.quantity === 0) {
        book.status = 'reserved';
    }
    await book.save();

    res.status(201).json(createdOrder);
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
const getMyOrders = async (req, res) => {
    // Find orders where the current user is the BUYER
    const orders = await Order.find({ buyer: req.user._id })
        .populate('book')   // Get current book details
        .populate('seller', 'full_name email phone address') // Get seller details
        .sort({ createdAt: -1 });

    // Privacy stripping
    const privacyFilteredOrders = orders.map(order => {
        const orderObj = order.toObject();
        if (order.status !== 'Accepted' && order.status !== 'Completed') {
            if (orderObj.seller) {
                delete orderObj.seller.phone;
                delete orderObj.seller.address;
                delete orderObj.seller.email;
            }
        }
        return orderObj;
    });

    res.json(privacyFilteredOrders);
};

// @desc    Get incoming orders for a seller
// @route   GET /api/orders/incoming
const getIncomingOrders = async (req, res) => {
    // Find orders where the current user is the SELLER
    const orders = await Order.find({ seller: req.user._id })
        .populate('book')
        .populate('buyer', 'full_name email phone address') // Get buyer details
        .sort({ createdAt: -1 });

    // Strip out contact info for privacy if not Accepted/Completed
    const privacyFilteredOrders = orders.map(order => {
        const orderObj = order.toObject();
        if (order.status !== 'Accepted' && order.status !== 'Completed') {
            if (orderObj.buyer) {
                delete orderObj.buyer.phone;
                delete orderObj.buyer.address;
                delete orderObj.buyer.email;
            }
        }
        return orderObj;
    });

    res.json(privacyFilteredOrders);
};

// @desc    Seller Accept or Reject an order
// @route   PUT /api/orders/:id/decision
const sellerDecision = async (req, res) => {
    const { decision } = req.body; // 'Accepted' or 'Rejected'
    const order = await Order.findById(req.params.id);

    if (order) {
        // Check if user is the seller
        if (order.seller.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (order.status !== 'Pending Approval') {
            return res.status(400).json({ message: 'Order is no longer pending' });
        }

        if (decision === 'Accepted') {
            // ENFORCEMENT for Seller
            if (!req.user.phone || !req.user.address) {
                return res.status(400).json({ message: "Please update your phone number and address in your profile before accepting orders." });
            }
            order.status = 'Accepted';
        } else if (decision === 'Rejected') {
            order.status = 'Rejected';
            // Release the Book back to 'available' and increment quantity
            const book = await Book.findById(order.book);
            if (book) {
                book.quantity += order.quantity;
                book.status = 'available';
                await book.save();
            }
        } else {
             return res.status(400).json({ message: 'Invalid decision' });
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Mutual Confirm Order (Mark as Completed if both confirm)
// @route   PUT /api/orders/:id/mutual-confirm
const mutualConfirm = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        // STRICT GUARD CLAUSE: Prevent double-click trust score exploits
        if (order.status === 'Completed') {
            return res.status(400).json({ message: 'Order is already completed.' });
        }

        if (order.status !== 'Accepted') {
            return res.status(400).json({ message: 'Order must be Accepted to confirm' });
        }

        // Determine who is confirming
        if (order.buyer.toString() === req.user._id.toString()) {
            order.buyerConfirmed = true;
        } else if (order.seller.toString() === req.user._id.toString()) {
            order.sellerConfirmed = true;
        } else {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // If both confirmed, complete it
        if (order.buyerConfirmed && order.sellerConfirmed) {
            order.status = 'Completed';
            const book = await Book.findById(order.book);
            if (book) {
                book.status = 'sold';
                await book.save();
            }

            // Increment trustScores for both buyer and seller
            await User.findByIdAndUpdate(order.buyer, { $inc: { trustScore: 1 } });
            await User.findByIdAndUpdate(order.seller, { $inc: { trustScore: 1 } });
        }

        const updatedOrder = await order.save();
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
        // Modify cancellation logic: Either buyer OR seller can cancel
        if (order.buyer.toString() !== req.user._id.toString() && order.seller.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Allow cancellation on Pending Approval OR Accepted
        if (order.status !== 'Pending Approval' && order.status !== 'Accepted') {
            return res.status(400).json({ message: 'Cannot cancel an order that is not Pending or Accepted' });
        }

        // Update Order to Cancelled
        order.status = 'Cancelled';
        await order.save();

        // Release the Book back to 'available' and increment quantity
        const book = await Book.findById(order.book);
        if (book) {
            book.quantity += order.quantity;
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

// @desc    Admin: Override order status
// @route   PUT /api/orders/:id/admin-override
const adminOverrideOrder = async (req, res) => {
    try {
        const { decision } = req.body; // 'Completed' or 'Cancelled'
        const order = await Order.findById(req.params.id);
        if (order) {
            if (decision === 'Completed') {
                order.status = 'Completed';
            } else if (decision === 'Cancelled') {
                order.status = 'Cancelled';
                const book = await Book.findById(order.book);
                if (book) { 
                    book.quantity += order.quantity;
                    book.status = 'available'; 
                    await book.save(); 
                }
            } else {
                return res.status(400).json({ message: 'Invalid decision' });
            }
            await order.save();
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Override failed' });
    }
};

// @desc    Admin: Export orders as CSV
// @route   GET /api/orders/export/csv
const exportOrdersCSV = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('buyer', 'full_name email')
            .populate('seller', 'full_name email')
            .sort({ createdAt: -1 });
        
        let csv = 'Order ID,Book Title,Price,Status,Buyer Name,Buyer Email,Seller Name,Seller Email,Date\n';
        orders.forEach(order => {
            const bName = order.buyer?.full_name || 'N/A';
            const bEmail = order.buyer?.email || 'N/A';
            const sName = order.seller?.full_name || 'N/A';
            const sEmail = order.seller?.email || 'N/A';
            const date = new Date(order.createdAt).toISOString().split('T')[0];
            
            // Clean strings for CSV
            const safeBName = bName.replace(/"/g, '""');
            const safeSName = sName.replace(/"/g, '""');
            const safeTitle = order.bookTitle.replace(/"/g, '""');

            csv += `"${order._id}","${safeTitle}",${order.totalPrice},"${order.status}","${safeBName}","${bEmail}","${safeSName}","${sEmail}","${date}"\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="orders.csv"');
        return res.send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Export failed' });
    }
};

module.exports = {
    addOrder,
    getMyOrders,
    getIncomingOrders,
    sellerDecision,
    mutualConfirm,
    cancelOrder,
    getAllOrders,
    adminOverrideOrder,
    exportOrdersCSV,
};