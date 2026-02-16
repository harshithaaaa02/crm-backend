const AuditLog = require("../models/AuditLog");

const auditLog = (action, entity) => {
  return async (req, res, next) => {
    res.on("finish", async () => {
      if (res.statusCode < 400) {
        await AuditLog.create({
          action,
          entity,
          entityId: req.params.id || null,
          performedBy: req.headers.role || "system"
        });
      }
    });
    next();
  };
};

module.exports = auditLog;
