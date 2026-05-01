const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  week: {
    type: Number,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  lessons: [{
    title: {
      type: String,
      required: true
    },
    content: {
      type: String, // Base content hint
      required: true
    },
    aiGeneratedContent: {
      type: String // Cached AI-synthesized content
    },
    videoUrl: {
      type: String
    },
    order: {
      type: Number,
      required: true
    }
  }],
  quiz: [{
    question: String,
    options: [String],
    correctAnswer: Number // Index of correct option
  }]
}, {
  timestamps: true
});

const Module = mongoose.model('Module', moduleSchema);
module.exports = Module;
