const express = require('express');
const router = express.Router();
const { createInteraction, getInteractions } = require('../controllers/interactionController');

router.post('/', createInteraction); // Log a call/email
router.get('/', getInteractions);    // View history

module.exports = router;