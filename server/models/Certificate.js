const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateId: {
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
  issueDate: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    default: 'SS WebTech'
  },
  status: {
    type: String,
    enum: ['Active', 'Revoked'],
    default: 'Active'
  },
  description: {
    type: String
  },
  // Blockchain Verification Fields
  blockchainHash: {
    type: String,
    unique: true,
    sparse: true
  },
  transactionId: {
    type: String
  },
  blockchainNetwork: {
    type: String,
    default: 'Polygon'
  },
  shortUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const Certificate = mongoose.model('Certificate', certificateSchema);
module.exports = Certificate;
