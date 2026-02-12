const Lead = require('../models/Lead');

// 1. Create a new Lead
exports.createLead = async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 2. Get All Leads
exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Update a Lead
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Delete a Lead (Soft Delete)
exports.deleteLead = async (req, res) => {
  try {
    // We hide it instead of erasing it permanently
    const lead = await Lead.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};