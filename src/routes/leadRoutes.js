const express = require('express');
const router = express.Router();
const { body } = require("express-validator");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const { protect } = require("../middlewares/authMiddleware");

// Import controller functions properly
const leadController = require('../controllers/leadController');
const { createLead, getAllLeads, updateLead,   deleteLead
 } = leadController;


// 🔹 CREATE LEAD (with validation)
router.post(
  '/',
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required")
  ],
  createLead
);

// 🔹 GET ALL LEADS
router.get('/', getAllLeads);

// 🔹 UPDATE LEAD
router.put('/:id', updateLead);

// 🔹 DELETE LEAD (Only Admin)
router.delete('/:id', authorizeRoles("admin"), leadController.deleteLead);

module.exports = router;
