const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: String,
    phone: String,
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Lost"],
      default: "New",
    },
    value: {
      type: Number,
      default: 0,
    },
    isDeleted: {
  type: Boolean,
  default: false,
},

  },
  { timestamps: true }
  
);

module.exports = mongoose.model("Lead", leadSchema);
