const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: String,
    entity: String,
    entityId: mongoose.Schema.Types.ObjectId,
    performedBy: mongoose.Schema.Types.ObjectId,
    timestamp: { type: Date, default: Date.now }
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
