const Certificate = require('../models/Certificate');
const OfferLetter = require('../models/OfferLetter');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// @desc    Get all certificates
const getCertificates = async (req, res) => {
  console.log('GET /api/certificates hit');
  try {
    const certificates = await Certificate.find({}).sort({ createdAt: -1 });
    console.log(`Found ${certificates.length} certificates`);
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single certificate
const getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.id });
    if (certificate) {
      res.json(certificate);
    } else {
      res.status(404).json({ message: 'Certificate not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a certificate
const createCertificate = async (req, res) => {
  const { studentName, studentEmail, internshipDomain, startDate, endDate, duration, companyName, description, issueDate } = req.body;

  try {
    const currentYear = new Date().getFullYear();
    // Find the latest certificate for the current year
    const latestCert = await Certificate.findOne({
      certificateId: new RegExp(`^SSW-${currentYear}-`)
    }).sort({ certificateId: -1 });

    let nextNumber = 1;
    if (latestCert) {
      const lastNumber = parseInt(latestCert.certificateId.split('-')[2]);
      nextNumber = lastNumber + 1;
    }
    
    const sequentialNo = nextNumber.toString().padStart(4, '0');
    const certificateId = `SSW-${currentYear}-${sequentialNo}`;

    const certificate = await Certificate.create({
      certificateId,
      studentName,
      studentEmail,
      internshipDomain,
      startDate,
      endDate,
      duration,
      companyName: companyName || 'SS WebTech',
      description,
      issueDate: issueDate || Date.now()
    });

    // ✅ Step 2: Generate Blockchain Fingerprint (SHA-256 Hash)
    // Normalize data (Dates to YYYY-MM-DD) to ensure consistent hashing
    const sDate = new Date(startDate).toISOString().split('T')[0];
    const eDate = new Date(endDate).toISOString().split('T')[0];
    const iDate = new Date(certificate.issueDate).toISOString().split('T')[0];
    
    const fingerprintData = `${certificateId}|${studentName}|${studentEmail}|${internshipDomain}|${sDate}|${eDate}|${iDate}`;
    const blockchainHash = crypto.createHash('sha256').update(fingerprintData).digest('hex');
    
    // ✅ Step 3: Self-hosted redirect
    // Use FRONTEND_URL from env, or auto-detect from the current request host
    const protocol = req.protocol === 'https' ? 'https' : 'http';
    const host = process.env.FRONTEND_URL || `${protocol}://${req.get('host')}`;
    const shortUrl = `${host}/r/${certificateId}`;
    
    certificate.blockchainHash = blockchainHash;
    certificate.shortUrl = shortUrl;
    
    // Simulated Transaction ID (In production, this would be the real Polygon TX ID)
    certificate.transactionId = `0x${crypto.randomBytes(32).toString('hex')}`;
    
    await certificate.save();
    console.log(`[Blockchain] Fingerprint generated for ${certificateId}: ${blockchainHash}`);
    console.log(`[Redirect] URL generated: ${shortUrl}`);

    res.status(201).json(certificate);
  } catch (error) {
    console.error('Create Certificate Error:', error);
    res.status(400).json({ message: 'Invalid certificate data', error: error.message });
  }
};

// @desc    Update a certificate
const updateCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.id });

    if (certificate) {
      certificate.studentName = req.body.studentName || certificate.studentName;
      certificate.studentEmail = req.body.studentEmail || certificate.studentEmail;
      certificate.internshipDomain = req.body.internshipDomain || certificate.internshipDomain;
      certificate.startDate = req.body.startDate || certificate.startDate;
      certificate.endDate = req.body.endDate || certificate.endDate;
      certificate.duration = req.body.duration || certificate.duration;
      certificate.status = req.body.status || certificate.status;
      certificate.description = req.body.description || certificate.description;
      certificate.issueDate = req.body.issueDate || certificate.issueDate;

      const updatedCertificate = await certificate.save();
      res.json(updatedCertificate);
    } else {
      res.status(404).json({ message: 'Certificate not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a certificate
const deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.id });

    if (certificate) {
      await Certificate.deleteOne({ _id: certificate._id });
      res.json({ message: 'Certificate removed' });
    } else {
      res.status(404).json({ message: 'Certificate not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Generate PDF for a certificate
const generatePDF = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.id });
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const layout = req.query.layout === 'landscape' ? 'landscape' : 'portrait';
    const isLandscape = layout === 'landscape';

    const doc = new PDFDocument({
      size: 'A4',
      layout: layout,
      margin: 0
    });

    const isPreview = req.query.preview === 'true';
    res.setHeader('Content-Type', 'application/pdf');
    
    if (isPreview) {
      res.setHeader('Content-Disposition', 'inline');
    } else {
      res.setHeader('Content-Disposition', `attachment; filename=Certificate-${certificate.certificateId}.pdf`);
    }

    doc.pipe(res);

    // --- Exact Template Implementation ---

    // 1. Background Layers
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff'); 
    doc.rect(10, 10, doc.page.width - 20, doc.page.height - 20).fill('#f8fafc'); 

    // 2. Multi-layered Border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).strokeColor('#1e3a8a').lineWidth(8).stroke(); 
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).strokeColor('#d4af37').lineWidth(2).stroke(); 

    // 3. Corner Accents
    const margin = 20;
    const accentSize = 60;
    doc.path(`M ${margin} ${margin} L ${margin + accentSize} ${margin} L ${margin} ${margin + accentSize} Z`).fill('#1e3a8a');
    doc.path(`M ${doc.page.width - margin} ${margin} L ${doc.page.width - margin - accentSize} ${margin} L ${doc.page.width - margin} ${margin + accentSize} Z`).fill('#1e3a8a');
    doc.path(`M ${margin} ${doc.page.height - margin} L ${margin + accentSize} ${doc.page.height - margin} L ${margin} ${doc.page.height - margin - accentSize} Z`).fill('#1e3a8a');
    doc.path(`M ${doc.page.width - margin} ${doc.page.height - margin} L ${doc.page.width - margin - accentSize} ${doc.page.height - margin} L ${doc.page.width - margin} ${doc.page.height - margin - accentSize} Z`).fill('#1e3a8a');

    // 4. Logo Section
    const logoPath = path.join(__dirname, '../../logo100.png');
    if (fs.existsSync(logoPath)) {
      const logoWidth = isLandscape ? 240 : 250;
      doc.image(logoPath, (doc.page.width - logoWidth) / 2, isLandscape ? 45 : 80, { width: logoWidth });
    }

    // 5. Text Content Section
    const titleY = isLandscape ? 140 : 200;
    doc.font('Helvetica-Bold').fontSize(isLandscape ? 32 : 24).fillColor('#1e3a8a').text('CERTIFICATE OF INTERNSHIP', 0, titleY, { align: 'center', characterSpacing: 2 });
    doc.font('Helvetica').fontSize(isLandscape ? 12 : 12).fillColor('#64748b').text('THIS IS PROUDLY PRESENTED TO', 0, titleY + (isLandscape ? 40 : 55), { align: 'center', characterSpacing: 3 });
    
    const nameY = isLandscape ? 215 : 300;
    const nameText = certificate.studentName.toUpperCase();
    doc.font('Helvetica-Bold').fontSize(isLandscape ? 28 : 28.5).fillColor('#0f172a').text(nameText, 0, nameY, { align: 'center' });

    const textWidth = doc.widthOfString(nameText);
    const startX = (doc.page.width - textWidth) / 2;
    doc.moveTo(startX - 20, nameY + (isLandscape ? 32 : 38)).lineTo(startX + textWidth + 20, nameY + (isLandscape ? 32 : 38)).strokeColor('#d4af37').lineWidth(4).stroke();

    const bodyY = isLandscape ? 280 : 365;
    doc.font('Helvetica').fontSize(isLandscape ? 12 : 12).fillColor('#334155').text(`has successfully completed an Internship as a`, 0, bodyY, { align: 'center' });
    doc.font('Helvetica-Bold').fontSize(isLandscape ? 18 : 13.5).fillColor('#1e3a8a').text(`${certificate.internshipDomain.toUpperCase()} at SS WebTech.`, 0, bodyY + 22, { align: 'center' });

    const start = new Date(certificate.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const end = new Date(certificate.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#475569').text(`Duration: ${start} to ${end}`, 0, bodyY + (isLandscape ? 48 : 50), { align: 'center' });

    const summary = certificate.description || "During the internship period, the student was involved in designing, developing, and maintaining web applications. Working sincerely with the team, demonstrating good technical skills, dedication, and enthusiasm towards learning.";
    doc.font('Helvetica').fontSize(isLandscape ? 10 : 11).fillColor('#475569').text(summary, isLandscape ? 80 : 80, bodyY + (isLandscape ? 75 : 85), { align: 'center', lineGap: isLandscape ? 3 : 4, width: doc.page.width - (isLandscape ? 160 : 160) });

    doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a').text(`Performance during the internship was found to be satisfactory.`, 0, doc.y + (isLandscape ? 8 : 25), { align: 'center' });
    
    const issueDate = new Date(certificate.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a').text(`DATE: ${issueDate.toUpperCase()}`, 0, doc.y + (isLandscape ? 5 : 15), { align: 'center' });

    // 6. Footer Layout Constants (Define early for use in QR positioning)
    const footerY = doc.page.height - (isLandscape ? 140 : 170);
    const paddingX = isLandscape ? 100 : 70;

    // QR Code Section
    const verificationUrl = certificate.shortUrl || `${process.env.FRONTEND_URL}/verify.html?id=${certificate.certificateId}`;
    const qrCodeImage = await QRCode.toDataURL(verificationUrl, { margin: 1 });
    const qrBuffer = Buffer.from(qrCodeImage.split(',')[1], 'base64');
    
    const qrWidth = isLandscape ? 65 : 80;
    const qrY = isLandscape ? footerY - 5 : (doc.y + 15);
    const qrX = isLandscape ? (doc.page.width - qrWidth) / 2 : (doc.page.width - qrWidth) / 2;
    doc.image(qrBuffer, qrX, qrY, { width: qrWidth });
    
    // Position ID text below the QR code
    doc.font('Courier').fontSize(isLandscape ? 7 : 8).fillColor('#64748b').text(`ID: ${certificate.certificateId}`, 0, qrY + qrWidth + (isLandscape ? 0 : 0), { align: 'center', width: doc.page.width });

    // 6. Footer Section
    // (Constants already defined above)

    const msmePath = path.join(__dirname, '../../image.png');
    if (fs.existsSync(msmePath)) {
      doc.image(msmePath, paddingX, isLandscape ? footerY : footerY, { height: isLandscape ? 65 : 75 });
    }

    // Signature Section
    const signatureWidth = 150;
    const signatureX = doc.page.width - paddingX - signatureWidth;
    const signY = footerY + (isLandscape ? 60 : 60); // Lower the line slightly
    
    // Digital Signature Image
    const signaturePath = path.join(__dirname, '../../signature.png');
    if (fs.existsSync(signaturePath)) {
      doc.image(signaturePath, signatureX + 5, signY - 30, { width: 140 });
    }
    
    doc.moveTo(signatureX, signY).lineTo(signatureX + signatureWidth, signY).strokeColor('#1e3a8a').lineWidth(1).stroke();
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#1e3a8a').text('FOUNDER & CEO', signatureX, signY + (isLandscape ? 5 : 5), { width: signatureWidth, align: 'center' });

    // Official Stamp Image
    const stampPath = path.join(__dirname, '../../sswebtechstamp.png');
    if (fs.existsSync(stampPath)) {
      doc.image(stampPath, signatureX + 30, signY - 80, { width: 90 });
    }

    doc.end();

  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
};

// @desc    Dashboard Stats
const getDashboardStats = async (req, res) => {
  console.log('GET /api/certificates/stats hit');
  try {
    const totalCertificates = await Certificate.countDocuments();
    const activeCertificates = await Certificate.countDocuments({ status: 'Active' });
    const revokedCertificates = await Certificate.countDocuments({ status: 'Revoked' });
    const recentCertificates = await Certificate.find({}).sort({ createdAt: -1 }).limit(5);

    const totalOffers = await OfferLetter.countDocuments();
    
    console.log('Stats calculated successfully');
    res.json({
      totalCertificates,
      activeCertificates,
      revokedCertificates,
      recentCertificates,
      totalOffers
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc  Update all certificate redirect URLs when domain changes
// @route PUT /api/certificates/update-domain
// @access Admin (protected)
const updateRedirectDomain = async (req, res) => {
  const { newDomain } = req.body;

  if (!newDomain) {
    return res.status(400).json({ message: 'newDomain is required. Example: https://sswebtech.com' });
  }

  try {
    const certificates = await Certificate.find({});
    let updatedCount = 0;

    for (const cert of certificates) {
      cert.shortUrl = `${newDomain}/r/${cert.certificateId}`;
      await cert.save();
      updatedCount++;
    }

    console.log(`[Domain Update] Updated ${updatedCount} certificates to new domain: ${newDomain}`);
    res.json({
      message: `✅ Successfully updated ${updatedCount} certificates to new domain.`,
      newDomain,
      updatedCount
    });
  } catch (error) {
    console.error('Domain Update Error:', error);
    res.status(500).json({ message: 'Server Error during domain update' });
  }
};

module.exports = {
  getCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  generatePDF,
  getDashboardStats,
  updateRedirectDomain
};
