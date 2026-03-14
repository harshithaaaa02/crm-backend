const mongoose = require("mongoose");

const installmentSchema = new mongoose.Schema({
  phase: String,
  percentage: Number,
  amount: Number,
  paid: { type: Boolean, default: false },
  paidAt: Date,
});

const messageSchema = new mongoose.Schema({
  from: { type: String, enum: ["admin", "client"], required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    handledBy: String,
    totalPayment: { type: Number, required: true },
    installments: [installmentSchema],
    deadline: Date,
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    messages: [messageSchema],
    documents: [documentSchema],
    stage: {
      type: String,
      enum: ["Intake", "Planning", "Execution", "Delivery", "Completed"],
      default: "Intake",
    },
    // ✅ soft delete
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
