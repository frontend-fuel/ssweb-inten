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
const offerLetterRoutes = require('./routes/offerLetterRoutes');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 🚀 MOVED: Mount routes BEFORE static files to prevent folder conflicts
app.use('/v1/api/admin', adminRoutes);
app.use('/v1/api/certificates', certificateRoutes);
app.use('/v1/api/students', studentRoutes);
app.use('/v1/api/lms', lmsRoutes);
app.use('/v1/api/offers', offerLetterRoutes);

// Static folder for frontend
app.use(express.static(path.join(__dirname, '..')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/certificate_system')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Frontend routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../login.html')));
app.get('/admin', (req, res) => res.redirect('/login'));
app.get('/admin/login', (req, res) => res.redirect('/login'));

// Safety Fallback for legacy POST login attempts
app.post('/admin/login', (req, res) => res.redirect(307, '/v1/api/admin/login'));

app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../dashboard.html')));
app.get('/verify', (req, res) => res.sendFile(path.join(__dirname, '../verify.html')));
app.get('/ledger', (req, res) => res.sendFile(path.join(__dirname, '../ledger.html')));
app.get('/playground', (req, res) => res.sendFile(path.join(__dirname, '../playground.html')));

// ✅ Self-Hosted Certificate Redirect — QR codes point here
const handleRedirect = (req, res) => {
  const certId = req.params.id;
  console.log(`[Redirect] Routing ID ${certId} to verification page`);
  res.redirect(301, `/verify.html?id=${certId}`);
};

app.get('/r/:id', handleRedirect);
app.get('/api/r/:id', handleRedirect); // Safety fallback

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
