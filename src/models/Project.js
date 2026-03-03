const mongoose = require("mongoose");

const installmentSchema = new mongoose.Schema({
  phase: String,
  percentage: Number,
  amount: Number,
  paid: { type: Boolean, default: false }
});

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    handledBy: String,
    totalPayment: { type: Number, required: true },

    installments: [installmentSchema],

    deadline: Date,

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);