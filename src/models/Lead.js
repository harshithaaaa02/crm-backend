const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    // ✅ added for pipeline company/project view
    company: { type: String, default: "" },
    projectName: { type: String, default: "" },

    value: { type: Number, default: 0 },

    // keep old statuses so other pages don't break
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
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);