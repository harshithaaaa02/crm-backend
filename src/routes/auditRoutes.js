const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const AuditLog = require("../models/AuditLog");

router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const logs = await AuditLog.find().sort({ createdAt: -1 });
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
