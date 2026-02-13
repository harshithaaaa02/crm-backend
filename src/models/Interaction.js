const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Call', 'Email', 'Meeting', 'Note'],
    required: true
  },
  details: {
    type: String,
    required: true
  },
  // We can link an interaction to a Lead OR a Client
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Interaction', interactionSchema);