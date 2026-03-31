require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // <--- IMPORTANT IMPORT
const connectDB = require('./config/db');
const scheduleCronJobs = require('./utils/cronJobs');

// Connect to Database
connectDB();

// Initialize Cron Jobs
scheduleCronJobs();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// ⬇️ THIS LINE IS CRITICAL FOR IMAGES ⬇️
// It makes the 'uploads' folder public so React can see the photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});