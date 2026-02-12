const express = require("express");
const router = express.Router();

const {
  updateLead,
  createLead,
  getAllLeads
} = require("../controllers/leadController");
router.post("/", createLead);
router.get("/", getAllLeads);
router.put("/:id", updateLead);

module.exports = router;
