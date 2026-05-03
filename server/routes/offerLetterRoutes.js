const express = require('express');
const router = express.Router();
const {
  getOfferLetters,
  getOfferLetterById,
  createOfferLetter,
  updateOfferLetter,
  deleteOfferLetter,
  generatePDF
} = require('../controllers/offerLetterController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getOfferLetters)
  .post(protect, createOfferLetter);

router.route('/:id')
  .get(protect, getOfferLetterById)
  .put(protect, updateOfferLetter)
  .delete(protect, deleteOfferLetter);

router.get('/:id/pdf', generatePDF);

module.exports = router;
