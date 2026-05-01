const express = require('express');
const router = express.Router();
const {
  getCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  generatePDF,
  getDashboardStats,
  updateRedirectDomain
} = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');

router.route('/stats').get(protect, getDashboardStats);
router.route('/update-domain').put(protect, updateRedirectDomain); // Bulk update on domain change

router.route('/')
  .get(protect, getCertificates)
  .post(protect, createCertificate);

router.route('/:id')
  .get(getCertificateById) // Public for verification
  .put(protect, updateCertificate)
  .delete(protect, deleteCertificate);

router.route('/:id/pdf').get(generatePDF); // Public to download

module.exports = router;
