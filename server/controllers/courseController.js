const Course = require('../models/Course');
const Module = require('../models/Module');
const Student = require('../models/Student');

// @desc    Get the flagship course with all modules
// @route   GET /api/lms/course
const getCourse = async (req, res) => {
  try {
    const course = await Course.findOne();
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Since we upgraded the Course model to include modules internally
    const modules = course.modules;
    
    const progress = {
        completedModules: req.student.completedModules || [],
        completedLessons: req.student.completedLessons || [],
        quizScores: req.student.quizScores || []
    };

    res.json({ course, modules, progress });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get a specific module by ID
// @route   GET /api/lms/modules/:id
const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    res.json(module);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Submit module quiz
// @route   POST /api/lms/modules/:id/quiz
const submitQuiz = async (req, res) => {
  const { answers } = req.body; // Array of selected option indices
  try {
    const module = await Module.findById(req.params.id);
    if (!module || !module.quiz || module.quiz.length === 0) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const student = await Student.findById(req.student._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Calculate score
    let correctCount = 0;
    module.quiz.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / module.quiz.length) * 100);
    const passed = scorePercent >= 70;

    if (passed) {
      // REQUIREMENT: All lessons in this module must be completed
      const allLessonsDone = module.lessons.every(l => 
        student.completedLessons.includes(l._id.toString())
      );

      if (allLessonsDone) {
        // Add to completedModules if not already there
        await Student.findByIdAndUpdate(req.student._id, {
          $addToSet: { completedModules: req.params.id }
        });
      }
    }

    // Update quiz scores using findByIdAndUpdate to avoid password validation issues
    const studentForUpdate = await Student.findById(req.student._id);
    const existingScoreIndex = studentForUpdate.quizScores.findIndex(s => s.moduleId.toString() === req.params.id);
    
    if (existingScoreIndex > -1) {
      studentForUpdate.quizScores[existingScoreIndex].score = scorePercent;
      studentForUpdate.quizScores[existingScoreIndex].passed = passed;
      studentForUpdate.quizScores[existingScoreIndex].attemptedAt = Date.now();
    } else {
      studentForUpdate.quizScores.push({ moduleId: req.params.id, score: scorePercent, passed });
    }
    
    await Student.findByIdAndUpdate(req.student._id, {
      quizScores: studentForUpdate.quizScores
    });

    res.json({
      score: scorePercent,
      correctCount,
      totalQuestions: module.quiz.length,
      passed,
      message: passed ? 'Congratulations! You passed the module.' : 'You did not reach the 70% threshold. Please try again.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const explainWithAI = async (req, res) => {
  const { topic, content, moduleId, lessonId } = req.body;
  
  try {
    // 1. Check database for stored content. AI generation is DISABLED.
    if (moduleId && lessonId) {
      const module = await Module.findById(moduleId);
      if (module) {
        const lesson = module.lessons.id(lessonId) || module.lessons.find(l => l._id.toString() === lessonId);
        if (lesson && lesson.aiGeneratedContent) {
          return res.json({ explanation: lesson.aiGeneratedContent });
        }
      }
    }

    res.json({ explanation: "### 🚧 Content Coming Soon\nThis lesson is currently being finalized. Please check back shortly!" });
  } catch (error) {
    console.error('[Static Content Error]:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Mark lesson as completed
// @route   POST /api/lms/lessons/:id/complete
const markLessonComplete = async (req, res) => {
  try {
    const lessonId = req.params.id;
    await Student.findByIdAndUpdate(req.student._id, { 
      $addToSet: { completedLessons: lessonId } 
    });

    // Check if we should auto-complete the module (if no quiz exists)
    const module = await Module.findOne({ 'lessons._id': lessonId });
    if (module && (!module.quiz || module.quiz.length === 0)) {
        const student = await Student.findById(req.student._id);
        const allLessonsDone = module.lessons.every(l => 
            l._id.toString() === lessonId || student.completedLessons.includes(l._id.toString())
        );
        
        if (allLessonsDone) {
            await Student.findByIdAndUpdate(req.student._id, {
                $addToSet: { completedModules: module._id }
            });
        }
    }

    res.json({ message: 'Lesson completed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const submitProject = async (req, res) => {
  const { link } = req.body;
  const Module = require('../models/Module');
  try {
    const student = await Student.findByIdAndUpdate(req.student._id, {
      projectLink: link,
      projectSubmittedAt: new Date()
    }, { new: true });

    // Auto-complete the Project Submission module (Week 8, Module 3)
    const subModule = await Module.findOne({ week: 8, order: 3 });
    if (subModule) {
        await Student.findByIdAndUpdate(req.student._id, {
            $addToSet: { 
                completedModules: subModule._id,
                completedLessons: subModule.lessons[0]._id.toString()
            }
        });
    }

    res.json({ message: 'Project submitted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getCourse,
  getModuleById,
  submitQuiz,
  explainWithAI,
  markLessonComplete,
  submitProject
};
