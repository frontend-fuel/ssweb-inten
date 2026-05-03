const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

// @desc    Register a new student
// @route   POST /api/students/register
const registerStudent = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const studentExists = await Student.findOne({ email });
    if (studentExists) {
      return res.status(400).json({ message: 'Student already exists' });
    }

    const student = await Student.create({ name, email, password });

    if (student) {
      res.status(201).json({
        _id: student._id,
        name: student.name,
        email: student.email,
        token: generateToken(student._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid student data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Auth student & get token
// @route   POST /api/students/login
const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email });

    if (student && (await student.matchPassword(password))) {
      if (!student.isApproved) {
        return res.status(403).json({ message: 'Your account is pending admin approval. Please contact support.' });
      }
      
      res.json({
        _id: student._id,
        name: student.name,
        email: student.email,
        token: generateToken(student._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get student profile
// @route   GET /api/students/profile
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.student._id);
    if (student) {
      res.json({
        _id: student._id,
        name: student.name,
        email: student.email,
        createdAt: student.createdAt,
        isApproved: student.isApproved
      });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get student certificates
// @route   GET /api/students/certificates
const getStudentCertificates = async (req, res) => {
  const Certificate = require('../models/Certificate');
  try {
    // Find certificates where studentEmail matches the logged-in student's email
    const certificates = await Certificate.find({ studentEmail: req.student.email });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Change student password
// @route   PUT /api/students/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const student = await Student.findById(req.student._id);
    
    if (student && (await student.matchPassword(currentPassword))) {
      student.password = newPassword;
      await student.save();
      res.json({ message: 'Password changed successfully' });
    } else {
      res.status(401).json({ message: 'Invalid current password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get student offer letters
// @route   GET /api/students/offers
const getStudentOfferLetters = async (req, res) => {
  const OfferLetter = require('../models/OfferLetter');
  try {
    const offers = await OfferLetter.find({ studentEmail: req.student.email }).sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = {
  registerStudent,
  loginStudent,
  getStudentProfile,
  getStudentCertificates,
  getStudentOfferLetters,
  changePassword
};
