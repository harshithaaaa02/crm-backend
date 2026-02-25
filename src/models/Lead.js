const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['New', 'Contacted', 'Negotiation', 'Confirmed', 'Lost'], 
    default: 'New' 
  },
  history: [{
    type: { type: String },
    date: { type: Date, default: Date.now },
    desc: { type: String }
  }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);