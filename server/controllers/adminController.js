const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const loginAdmin = async (req, res) => {
  const username = req.body.username ? req.body.username.trim() : '';
  const password = req.body.password ? req.body.password.trim() : '';
  console.log('[DEBUG] Admin Login Attempt:', { username });

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
        console.log('[DEBUG] Admin not found in DB');
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await admin.matchPassword(password);
    console.log('[DEBUG] Password Match Result:', isMatch);

    if (isMatch) {
      res.json({
        _id: admin._id,
        username: admin.username,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a default admin for initial setup
const setupAdmin = async (req, res) => {
  try {
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = await Admin.create({
      username: 'admin',
      password: 'password123'
    });

    res.status(201).json({
      message: 'Admin created successfully',
      username: admin.username
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const Student = require('../models/Student');

const Course = require('../models/Course');

// @desc    Get all students
// @route   GET /api/admin/students
const getStudents = async (req, res) => {
  try {
    const course = await Course.findOne();
    if (!course) return res.json([]);

    // Calculate totals and get all valid lesson IDs
    const totalModulesCount = course.modules.length;
    let allValidLessonIds = [];
    course.modules.forEach(m => {
        m.lessons.forEach(l => allValidLessonIds.push(l._id.toString()));
    });
    const totalLessonsCount = allValidLessonIds.length;

    const students = await Student.find().sort({ createdAt: -1 });
    
    const studentsWithProgress = students.map(s => {
      // Only count completed lessons that still exist in the current course
      const validCompletedLessons = s.completedLessons ? 
        s.completedLessons.filter(id => allValidLessonIds.includes(id.toString())) : [];
      
      const completedModulesCount = s.completedModules ? s.completedModules.length : 0;
      const lessonPercent = totalLessonsCount > 0 ? Math.round((validCompletedLessons.length / totalLessonsCount) * 100) : 0;
      
      return {
        ...s.toObject(),
        progressPercentage: lessonPercent,
        masteryCount: `${completedModulesCount} / ${totalModulesCount}`
      };
    });

    res.json(studentsWithProgress);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Toggle student approval status
// @route   PUT /api/admin/students/:id/approve
const toggleStudentApproval = async (req, res) => {
  try {
    // First find to get current status
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const newApprovalStatus = !student.isApproved;

    // Use findByIdAndUpdate to avoid triggering pre-save hooks (bcrypt rehash issue)
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: { isApproved: newApprovalStatus } },
      { new: true, runValidators: false }
    );

    console.log(`[Admin] Student ${updated.name} approval set to: ${updated.isApproved}`);
    res.json({
      message: `Student ${updated.isApproved ? 'approved' : 'unapproved'} successfully`,
      isApproved: updated.isApproved
    });
  } catch (error) {
    console.error('[Admin] toggleStudentApproval error:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const resetStudentPassword = async (req, res) => {
  const { newPassword } = req.body;
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    student.password = newPassword;
    await student.save();
    res.json({ message: 'Student password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { loginAdmin, setupAdmin, getStudents, toggleStudentApproval, resetStudentPassword, deleteStudent };
