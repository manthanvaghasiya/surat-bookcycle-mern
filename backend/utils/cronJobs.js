const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const Book = require('../models/Book');

// This job runs every hour (minute 0 of every hour)
const scheduleCronJobs = () => {
    cron.schedule('0 * * * *', async () => {
        console.log('[Cron Job] Running cleanup for old sold books...');
        try {
            // Find books that have been strictly marked as 'sold'
            // and were updated/sold more than 24 hours ago.
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            const oldSoldBooks = await Book.find({
                status: 'sold',
                updatedAt: { $lt: twentyFourHoursAgo }
            });

            if (oldSoldBooks.length === 0) {
                console.log('[Cron Job] No old sold books to clean up at this time.');
                return;
            }

            let deletedCount = 0;

            for (const book of oldSoldBooks) {
                // Safely delete the physical image file if it exists
                if (book.image) {
                    const imagePath = path.resolve(book.image);
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                }

                // Delete the book entry from MongoDB
                await Book.findByIdAndDelete(book._id);
                deletedCount++;
            }

            console.log(`[Cron Job] Successfully removed ${deletedCount} old sold books and their images.`);
        } catch (error) {
            console.error('[Cron Job] Error during cleanup:', error);
        }
    });
};

module.exports = scheduleCronJobs;
