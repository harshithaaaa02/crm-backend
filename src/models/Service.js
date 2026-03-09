const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true
  },

  createdDate: {
    type: Date
  },

  monthlyAmount: {
    type: Number,
    required: true
  },

  monthlyPayDate: {
    type: Date,
    required: true
  },

  handledBy: {
    type: String
  },
  paymentDay: {
  type: Number,
  required: true
},

  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);