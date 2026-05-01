const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  progress: [{
    lessonId: String,
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isApproved: {
    type: Boolean,
    default: false
  },
  completedModules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  completedLessons: [{
    type: String
  }],
  quizScores: [{
    moduleId: mongoose.Schema.Types.ObjectId,
    score: Number,
    passed: Boolean,
    attemptedAt: { type: Date, default: Date.now }
  }],
  projectLink: {
    type: String,
    default: null
  },
  projectSubmittedAt: {
    type: Date
  }
}, {
  timestamps: true
});

studentSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

studentSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
