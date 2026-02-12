const express = require('express');
const router = express.Router();
// Import the functions using the Team's names
const { createLead, getAllLeads, updateLead } = require('../controllers/leadController');

router.post('/', createLead);       // Create
router.get('/', getAllLeads);       // Get All (Team named it getAllLeads)
router.put('/:id', updateLead);     // Update

module.exports = router;