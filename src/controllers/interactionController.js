const Interaction = require('../models/Interaction');

// 1. Log a new Interaction
exports.createInteraction = async (req, res) => {
  try {
    const interaction = await Interaction.create(req.body);
    res.status(201).json(interaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 2. Get All Interactions (Sorted by newest)
exports.getInteractions = async (req, res) => {
  try {
    const interactions = await Interaction.find()
      .populate('lead', 'name company')   // Show Lead Name
      .populate('client', 'name company') // Show Client Name
      .sort({ date: -1 });
    res.status(200).json(interactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};