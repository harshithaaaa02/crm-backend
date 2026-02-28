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

  dueDate: Date,

  status: {
    type: String,
    default: "Pending"
  },

  // ✅ ADD THIS
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
