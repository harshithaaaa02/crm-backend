const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    company: { type: String, default: "" },

    email: { type: String, required: true, unique: true },

    username: { type: String, default: "" },

    password: { type: String, default: "" },

    projectName: { type: String, default: "" },

    phone: { type: String, default: "" },

    value: { type: Number, default: 0 },

    totalAmount: { type: Number, default: 0 },

    amountPaid: { type: Number, default: 0 },

    remaining: { type: Number, default: 0 },

    status: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "Negotiation",
        "Confirmed",
        "Lost",
        "Started",
        "Project Started",
        "In Progress",
        "Progress",
        "Deploying",
        "Deployment",
        "Live",
      ],
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

    leadScore: { type: Number, default: 0 },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);