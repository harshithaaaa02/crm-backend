const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  getDashboardStats,
  getMonthlyReport,
  getYearlyReport,
  exportClientsReport
} = require("../controllers/dashboardController");


// 🔐 Protect ALL routes in this file
router.use(protect);

router.get("/stats", getDashboardStats);
router.get("/monthly", getMonthlyReport);
router.get("/yearly", getYearlyReport);
router.get("/export", exportClientsReport);

module.exports = router;
