const express = require('express');
const router = express.Router();
const { registerStudent, loginStudent, getStudentProfile, getStudentCertificates, getStudentOfferLetters, changePassword } = require('../controllers/studentController');
const { studentProtect } = require('../middleware/studentAuth');

router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.get('/profile', studentProtect, getStudentProfile);
router.get('/certificates', studentProtect, getStudentCertificates);
router.get('/offers', studentProtect, getStudentOfferLetters);
router.put('/change-password', studentProtect, changePassword);

module.exports = router;
