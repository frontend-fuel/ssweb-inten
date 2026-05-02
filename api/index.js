const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Route files
const adminRoutes = require('../server/routes/adminRoutes');
const certificateRoutes = require('../server/routes/certificateRoutes');
const studentRoutes = require('../server/routes/studentRoutes');
const lmsRoutes = require('../server/routes/lmsRoutes');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static folder for frontend (Keep for local dev)
app.use(express.static(path.join(__dirname, '..')));

// Optimized MongoDB Connection (Caches connection for Serverless)
let cachedDb = null;
const connectDB = async () => {
    if (cachedDb) return cachedDb;
    console.log('[DB] Connecting to Cloud MongoDB...');
    cachedDb = await mongoose.connect(process.env.MONGODB_URI);
    console.log('[DB] Connected Successfully');
    return cachedDb;
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('[DB Error]:', err);
        res.status(500).json({ message: 'Database Connection Error' });
    }
});

// Mount routes (Both with and without /api prefix for Vercel compatibility)
app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/certificates', certificateRoutes);
app.use('/certificates', certificateRoutes);

app.use('/api/students', studentRoutes);
app.use('/students', studentRoutes);

app.use('/api/lms', lmsRoutes);
app.use('/lms', lmsRoutes);

// Frontend routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));
app.get('/login', (req, res) => res.redirect('/'));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../dashboard.html')));
app.get('/verify', (req, res) => res.sendFile(path.join(__dirname, '../verify.html')));

// ✅ Self-Hosted Certificate Redirect — QR codes point here
// If domain changes → run PUT /api/certificates/update-domain to update all DB records instantly
// This route will ALWAYS exist on your server regardless of domain name
app.get('/r/:id', (req, res) => {
  const certId = req.params.id;
  res.redirect(301, `/verify.html?id=${certId}`);
});

// Student Frontend routes (login & register now on index.html)
app.get('/student/login', (req, res) => res.redirect('/'));
app.get('/student/register', (req, res) => res.redirect('/'));
app.get('/student/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../student/dashboard.html')));
app.get('/student/course', (req, res) => res.sendFile(path.join(__dirname, '../student/course.html')));

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
