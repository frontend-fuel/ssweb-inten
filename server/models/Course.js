const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Full Stack Web Development (MERN)'
  },
  description: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String
  },
  modules: [{
    title: String,
    lessons: [{
      title: String,
      content: String,
      videoUrl: String,
      order: Number
    }],
    quiz: [{
      question: String,
      options: [String],
      correctAnswer: Number // Index of the correct option
    }]
  }]
}, {
  timestamps: true
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
