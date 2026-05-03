const mongoose = require('mongoose');

const offerLetterSchema = new mongoose.Schema({
  offerId: {
    type: String,
    required: true,
    unique: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  internshipDomain: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  stipend: {
    type: String,
    default: 'Unpaid'
  },
  companyName: {
    type: String,
    default: 'SS WebTech'
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Revoked'],
    default: 'Active'
  }
}, {
  timestamps: true
});

const OfferLetter = mongoose.model('OfferLetter', offerLetterSchema);
module.exports = OfferLetter;
