const express = require('express');
const router = express.Router();
const { createLead, getLeads, updateLead, deleteLead } = require('../controllers/leadController');

router.post('/', createLead);       // Create
router.get('/', getLeads);          // Read All
router.put('/:id', updateLead);     // Update
router.delete('/:id', deleteLead);  // Delete

module.exports = router;