const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // If you don't have User model yet, keep it as ObjectId
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["lead", "client", "task", "system"],
      default: "system"
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
