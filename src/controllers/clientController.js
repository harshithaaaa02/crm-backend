const Client = require('../models/Client');

// 1. Create Client
exports.createClient = async (req, res) => {
  try {
    const { name, email, revenue, lead } = req.body;
    const client = await Client.create({ name, email, revenue, lead });
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 2. Get All Clients
exports.getClients = async (req, res) => {
  try {
    // We use .populate('lead') to show the Lead details automatically
    const clients = await Client.find({ isDeleted: false })
                                .populate('lead')
                                .sort({ createdAt: -1 });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Update Client
exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 4. Delete Client (Soft Delete)
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};