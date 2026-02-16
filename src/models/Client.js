const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    relationshipScore: {
  type: Number,
  default: 50
},

  },
  { timestamps: true }
);

// Index for performance
clientSchema.index({ email: 1 });

clientSchema.index({ revenue: 1 });
clientSchema.index({ relationshipScore: 1 });
clientSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Client", clientSchema);
