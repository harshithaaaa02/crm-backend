const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true
  },

  description: String,

  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead"
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  dueDate: {
    type: Date
  },

  dueTime: {
    type: String
  },

  status: {
    type: String,
    default: "Pending"
  },

  notes: [
    {
      text: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]

},
{ timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);