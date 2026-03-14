const Lead = require("../models/Lead");
const Notification = require("../models/Notification");
const Client = require("../models/Client");
const Project = require("../models/Project");

// ✅ GET ALL LEADS — amounts calculated from projects
const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ isDeleted: false });

    const enrichedLeads = await Promise.all(
      leads.map(async (lead) => {
        // Find linked client
        const client = await Client.findOne({ email: lead.email, isDeleted: false });
          console.log("Lead:", lead.email, "Client found:", client?._id);
        let totalAmount = 0;
        let amountPaid = 0;

        if (client) {
          // Find all active projects for this client
          const projects = await Project.find({ client: client._id, isDeleted: false });
          console.log("Projects found:", projects.length);
          projects.forEach((project) => {
            totalAmount += project.totalPayment || 0;
            project.installments?.forEach((inst) => {
              if (inst.paid) amountPaid += inst.amount || 0;
            });
          });
        }

        const remaining = totalAmount - amountPaid;

        return {
          ...lead.toObject(),
          totalAmount,
          amountPaid,
          remaining,
        };
      })
    );

    res.json(enrichedLeads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ CREATE LEAD
const createLead = async (req, res) => {
  try {
    const { name, company, email, username, password, assignedTo } = req.body;

    const lead = await Lead.create({
      name: name || company,
      company,
      email,
      username,
      password,
      assignedTo,
      history: [{ type: "New", date: new Date(), desc: "Lead created in system." }],
    });

    // Auto-create client
    const existingClient = await Client.findOne({ email: lead.email });
    if (!existingClient) {
      await Client.create({
        name: lead.name,
        email: lead.email,
        revenue: 0,
        lead: lead._id,
      });
    }

    if (req.user) {
      const notification = await Notification.create({
        userId: req.user.id,
        title: "Lead Created",
        message: `${lead.name} was created`,
        type: "lead",
      });
      if (global.io) global.io.to(req.user.id.toString()).emit("notification", notification);
    }

    res.status(201).json(lead);
  } catch (error) {
    console.error("CREATE LEAD ERROR:", error.message);
    res.status(500).json({ message: "Lead creation failed", error: error.message });
  }
};

// ✅ UPDATE LEAD
const updateLead = async (req, res) => {

  try {
    const { id } = req.params;
    const { name, company, email, username, password, status, assignedTo } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    if (name !== undefined) lead.name = name;
    if (company !== undefined) lead.company = company;
    if (email !== undefined) lead.email = email;
    if (username !== undefined) lead.username = username;
    if (password !== undefined) lead.password = password;
    if (status !== undefined) lead.status = status;
    if (assignedTo !== undefined) lead.assignedTo = assignedTo;

    await lead.save();

    if (req.user) {
      const notification = await Notification.create({
        userId: req.user.id,
        title: "Lead Updated",
        message: `${lead.name} was updated`,
        type: "lead",
      });
      if (global.io) global.io.to(req.user.id.toString()).emit("notification", notification);
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// ✅ DELETE LEAD (soft delete lead + client + projects)
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    lead.isDeleted = true;
    await lead.save();

    // Soft delete linked client and their projects
    const client = await Client.findOne({ email: lead.email });
    if (client) {
      client.isDeleted = true;
      await client.save();

      await Project.updateMany(
        { client: client._id },
        { $set: { isDeleted: true } }
      );
    }

    if (req.user) {
      const notification = await Notification.create({
        userId: req.user.id,
        title: "Lead Deleted",
        message: `${lead.name} was deleted`,
        type: "lead",
      });
      if (global.io) global.io.to(req.user.id.toString()).emit("notification", notification);
    }

    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createLead, getAllLeads, updateLead, deleteLead };