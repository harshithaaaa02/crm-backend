const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    company: { type: String },

    email: { type: String, required: true, unique: true },

    username: { type: String },

    password: { type: String },

    totalAmount: { type: Number, default: 0 },

    amountPaid: { type: Number, default: 0 },

    remaining: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["New", "Contacted", "Negotiation", "Confirmed", "Lost"],
      default: "New",
    },

    history: [
      {
        type: { type: String },
        date: { type: Date, default: Date.now },
        desc: { type: String },
      },
    ],

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);