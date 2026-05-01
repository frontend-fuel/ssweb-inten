const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Full Stack Web Development - HTML, CSS, JS, Node.js, MongoDB'
  },
  description: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String
  }
}, {
  timestamps: true
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
