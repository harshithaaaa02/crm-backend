const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  stage: {
    type: String,
    enum: ['New', 'Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'],
    default: 'New'
  },
  probability: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  expectedCloseDate: {
    type: Date
  },
  notes: {
    type: String
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Deal', dealSchema);