const express = require('express');
const router = express.Router();
const { loginAdmin, setupAdmin, getStudents, toggleStudentApproval, resetStudentPassword, deleteStudent } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

router.post('/login', loginAdmin);
router.post('/setup', setupAdmin);
router.get('/students', protect, getStudents);
router.put('/students/:id/approve', protect, toggleStudentApproval);
router.put('/students/:id/reset-password', protect, resetStudentPassword);
router.delete('/students/:id', protect, deleteStudent);

module.exports = router;
