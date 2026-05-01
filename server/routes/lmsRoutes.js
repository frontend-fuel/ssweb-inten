const express = require('express');
const router = express.Router();
const { getCourse, getModuleById, submitQuiz, explainWithAI, markLessonComplete, submitProject } = require('../controllers/courseController');
const { studentProtect } = require('../middleware/studentAuth');

router.get('/course', studentProtect, getCourse);
router.get('/modules/:id', studentProtect, getModuleById);
router.post('/modules/:id/quiz', studentProtect, submitQuiz);
router.post('/lessons/:id/complete', studentProtect, markLessonComplete);
router.post('/ai-explain', studentProtect, explainWithAI);
router.post('/project/submit', studentProtect, submitProject);

module.exports = router;
