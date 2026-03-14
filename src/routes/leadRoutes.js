const express = require('express');
const router = express.Router();
const { body } = require("express-validator");

const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

const { createLead, getAllLeads, updateLead, deleteLead } = require('../controllers/leadController');

// CREATE LEAD — amounts removed, auto-calculated from projects
router.post(
  '/',
  protect,
  [
    body("company").notEmpty().withMessage("Company required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("username").notEmpty().withMessage("Username required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  createLead
);

// GET LEADS
router.get('/', protect, getAllLeads);

// UPDATE
router.put('/:id', protect, updateLead);

// DELETE (ADMIN ONLY)
router.delete('/:id', protect, authorize("admin"), deleteLead);

module.exports = router;