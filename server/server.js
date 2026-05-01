const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Route files
const adminRoutes = require('./routes/adminRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const studentRoutes = require('./routes/studentRoutes');
const lmsRoutes = require('./routes/lmsRoutes');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static folder for frontend
app.use(express.static(path.join(__dirname, '../public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/certificate_system')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Mount routes
app.use('/api/admin', adminRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/lms', lmsRoutes);

// Frontend routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
app.get('/login', (req, res) => res.redirect('/'));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../public/dashboard.html')));
app.get('/verify', (req, res) => res.sendFile(path.join(__dirname, '../public/verify.html')));

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
app.get('/student/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../public/student-dashboard.html')));
app.get('/student/course', (req, res) => res.sendFile(path.join(__dirname, '../public/course-view.html')));

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
