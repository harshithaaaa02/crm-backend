const Deal = require('../models/Deal');

// 1. Create a New Deal
exports.createDeal = async (req, res) => {
  try {
    const deal = await Deal.create(req.body);
    res.status(201).json(deal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 2. Get All Deals (Pipeline View)
exports.getDeals = async (req, res) => {
  try {
    const deals = await Deal.find({ isDeleted: false })
      .populate('client', 'name company email') // Show Client details
      .sort({ expectedCloseDate: 1 }); // Sort by closing soonest
    res.status(200).json(deals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Update Deal Stage (e.g., Move from "Negotiation" to "Won")
exports.updateDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    res.json(deal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 4. Delete Deal (Soft Delete)
exports.deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    res.json({ message: 'Deal removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};