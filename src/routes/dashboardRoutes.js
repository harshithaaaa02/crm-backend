const express = require("express");
const router = express.Router();


const {
  getDashboardStats,
  getMonthlyReport,
  getYearlyReport,
  exportClientsReport
} = require("../controllers/dashboardController");

router.get("/stats", getDashboardStats);
router.get("/monthly", getMonthlyReport);
router.get("/yearly", getYearlyReport);
router.get("/export", exportClientsReport);

module.exports = router;
