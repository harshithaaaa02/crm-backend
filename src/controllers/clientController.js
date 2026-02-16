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


exports.calculateRelationshipScore = async (req, res) => {
  try {
    const clients = await Client.find({ isDeleted: false });

    for (const client of clients) {
      let score = 50;

      // Revenue factor
      if (client.revenue > 20000) {
        score += 30;
      } else if (client.revenue > 10000) {
        score += 20;
      } else {
        score += 10;
      }

      // Recent activity factor
      const daysSinceUpdate =
        (Date.now() - new Date(client.updatedAt)) / (1000 * 60 * 60 * 24);

      if (daysSinceUpdate < 7) {
        score += 20;
      } else if (daysSinceUpdate < 30) {
        score += 10;
      } else {
        score -= 10;
      }

      client.relationshipScore = score;
      await client.save();

    }

    res.json({ message: "Relationship scores updated successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEngagementAnalysis = async (req, res) => {
  try {
    const clients = await Client.find({ isDeleted: false });

    const hot = [];
    const warm = [];
    const cold = [];
    const atRisk = [];

    for (const client of clients) {

      if (client.relationshipScore >= 80) {
        hot.push(client);
      } else if (client.relationshipScore >= 60) {
        warm.push(client);
      } else {
        cold.push(client);
      }

      const daysSinceUpdate =
        (Date.now() - new Date(client.updatedAt)) / (1000 * 60 * 60 * 24);

      if (daysSinceUpdate > 30) {
        atRisk.push(client);
      }
    }

    res.json({
      totalClients: clients.length,
      hot: hot.length,
      warm: warm.length,
      cold: cold.length,
      atRisk: atRisk.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};