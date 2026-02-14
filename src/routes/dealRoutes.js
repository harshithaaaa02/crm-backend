const express = require('express');
const router = express.Router();
const { createDeal, getDeals, updateDeal, deleteDeal } = require('../controllers/dealController');

router.post('/', createDeal);       // Create
router.get('/', getDeals);          // Read All
router.put('/:id', updateDeal);     // Update
router.delete('/:id', deleteDeal);  // Delete

module.exports = router;