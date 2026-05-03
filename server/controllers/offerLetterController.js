const OfferLetter = require('../models/OfferLetter');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// @desc    Get all offer letters
const getOfferLetters = async (req, res) => {
  try {
    const offerLetters = await OfferLetter.find({}).sort({ createdAt: -1 });
    res.json(offerLetters);
  } catch (error) {
    console.error('Error fetching offer letters:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single offer letter
const getOfferLetterById = async (req, res) => {
  try {
    const offerLetter = await OfferLetter.findOne({ offerId: req.params.id });
    if (offerLetter) {
      res.json(offerLetter);
    } else {
      res.status(404).json({ message: 'Offer letter not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create an offer letter
const createOfferLetter = async (req, res) => {
  const { studentName, studentEmail, internshipDomain, startDate, endDate, duration, stipend, companyName, issueDate } = req.body;

  try {
    const currentYear = new Date().getFullYear();
    const latestOffer = await OfferLetter.findOne({
      offerId: new RegExp(`^SSW-OFF-${currentYear}-`)
    }).sort({ offerId: -1 });

    let nextNumber = 1;
    if (latestOffer) {
      const parts = latestOffer.offerId.split('-');
      const lastNumber = parseInt(parts[parts.length - 1]);
      nextNumber = lastNumber + 1;
    }
    
    const sequentialNo = nextNumber.toString().padStart(4, '0');
    const offerId = `SSW-OFF-${currentYear}-${sequentialNo}`;

    const offerLetter = await OfferLetter.create({
      offerId,
      studentName,
      studentEmail,
      internshipDomain,
      startDate,
      endDate,
      duration,
      stipend: stipend || 'Unpaid',
      companyName: companyName || 'SS WebTech',
      issueDate: issueDate || Date.now()
    });

    res.status(201).json(offerLetter);
  } catch (error) {
    console.error('Create Offer Letter Error:', error);
    res.status(400).json({ message: 'Invalid offer letter data', error: error.message });
  }
};

// @desc    Update an offer letter
const updateOfferLetter = async (req, res) => {
  try {
    const offerLetter = await OfferLetter.findOne({ offerId: req.params.id });

    if (offerLetter) {
      offerLetter.studentName = req.body.studentName || offerLetter.studentName;
      offerLetter.studentEmail = req.body.studentEmail || offerLetter.studentEmail;
      offerLetter.internshipDomain = req.body.internshipDomain || offerLetter.internshipDomain;
      offerLetter.startDate = req.body.startDate || offerLetter.startDate;
      offerLetter.endDate = req.body.endDate || offerLetter.endDate;
      offerLetter.duration = req.body.duration || offerLetter.duration;
      offerLetter.stipend = req.body.stipend || offerLetter.stipend;
      offerLetter.status = req.body.status || offerLetter.status;
      offerLetter.issueDate = req.body.issueDate || offerLetter.issueDate;

      const updatedOfferLetter = await offerLetter.save();
      res.json(updatedOfferLetter);
    } else {
      res.status(404).json({ message: 'Offer letter not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete an offer letter
const deleteOfferLetter = async (req, res) => {
  try {
    const offerLetter = await OfferLetter.findOne({ offerId: req.params.id });

    if (offerLetter) {
      await OfferLetter.deleteOne({ _id: offerLetter._id });
      res.json({ message: 'Offer letter removed' });
    } else {
      res.status(404).json({ message: 'Offer letter not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Generate PDF for an offer letter
const generatePDF = async (req, res) => {
  try {
    const offerLetter = await OfferLetter.findOne({ offerId: req.params.id });
    
    if (!offerLetter) {
      return res.status(404).json({ message: 'Offer letter not found' });
    }

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    const isPreview = req.query.preview === 'true';
    res.setHeader('Content-Type', 'application/pdf');
    
    if (isPreview) {
      res.setHeader('Content-Disposition', 'inline');
    } else {
      res.setHeader('Content-Disposition', `attachment; filename=OfferLetter-${offerLetter.offerId}.pdf`);
    }

    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const result = Buffer.concat(chunks);
      res.send(result);
    });

    // 1. Header
    const logoPath = path.join(__dirname, '../../logo100.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 140 });
    }

    doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(22).text('OFFER LETTER', 50, 50, { align: 'right' });
    doc.fillColor('#64748b').font('Helvetica').fontSize(10).text(`Ref ID: ${offerLetter.offerId}`, 50, 80, { align: 'right' });
    doc.text(`Date: ${new Date(offerLetter.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`, 50, 95, { align: 'right' });

    doc.moveTo(50, 130).lineTo(545, 130).strokeColor('#e2e8f0').lineWidth(1).stroke();

    // 2. Recipient Info
    doc.moveDown(4);
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12).text('To,', 50, 160);
    doc.fontSize(14).text(offerLetter.studentName || 'N/A');
    doc.fillColor('#334155').font('Helvetica').fontSize(11).text(offerLetter.studentEmail || 'N/A');

    // 3. Subject
    doc.moveDown(2);
    doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(12).text(`Subject: Offer for ${offerLetter.internshipDomain} Internship`, 50, doc.y);

    // 4. Body Content
    doc.moveDown(1.5);
    doc.fillColor('#334155').font('Helvetica').fontSize(11);
    const textOptions = { align: 'justify', lineGap: 5 };
    
    doc.text(`Dear ${offerLetter.studentName},`, textOptions);
    doc.moveDown(0.5);
    doc.text(`We are pleased to offer you an internship position at SS WebTech as a ${offerLetter.internshipDomain} Intern. We were impressed by your background and are confident that your skills will be a valuable addition to our team.`, textOptions);
    
    doc.moveDown(0.8);
    doc.fillColor('#0f172a').font('Helvetica-Bold').text('Internship Details:');
    doc.fillColor('#334155').font('Helvetica').text(`• Role: ${offerLetter.internshipDomain} Intern`);
    doc.text(`• Start Date: ${new Date(offerLetter.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`);
    doc.text(`• End Date: ${new Date(offerLetter.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`);
    doc.text(`• Duration: ${offerLetter.duration}`);
    doc.text(`• Stipend: ${offerLetter.stipend}`);
    doc.text(`• Location: Remote / Work from Home`);

    doc.moveDown(0.8);
    doc.text(`During this internship, you will have the opportunity to work on real-world projects, collaborate with experienced professionals, and gain hands-on experience in the ${offerLetter.internshipDomain} domain. Your performance will be monitored, and a certificate of completion will be awarded upon successful completion of the internship and assigned tasks.`, textOptions);

    doc.moveDown(0.8);
    doc.text(`Please note that this is a learning-oriented internship. You are expected to maintain professional conduct, adhere to company policies, and respect confidentiality agreements during your tenure with us.`, textOptions);

    doc.moveDown(0.8);
    doc.text(`To accept this offer, please reply to this email or sign and return a copy of this letter within 48 hours. We look forward to having you on board!`, textOptions);

    // 5. Footer
    doc.moveDown(2);
    const footerY = doc.y > 600 ? doc.y : 620;
    
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12).text('For SS WebTech,', 50, footerY);
    
    const signaturePath = path.join(__dirname, '../../signature.png');
    if (fs.existsSync(signaturePath)) {
      doc.image(signaturePath, 50, footerY + 15, { width: 110 });
    }
    
    const stampPath = path.join(__dirname, '../../sswebtechstamp.png');
    if (fs.existsSync(stampPath)) {
      doc.image(stampPath, 160, footerY - 5, { width: 85 });
    }

    doc.fillColor('#1e3a8a').text('Authorized Signatory', 50, footerY + 70);

    // Contact Info
    doc.moveTo(50, 765).lineTo(545, 765).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
    doc.fontSize(8).fillColor('#94a3b8').text('+91 9391502293', 50, 775, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('PDF Generation Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error generating PDF', error: error.message });
    }
  }
};

module.exports = {
  getOfferLetters,
  getOfferLetterById,
  createOfferLetter,
  updateOfferLetter,
  deleteOfferLetter,
  generatePDF
};
