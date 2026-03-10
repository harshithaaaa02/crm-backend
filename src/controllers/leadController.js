const Lead = require("../models/Lead");
const Notification = require("../models/Notification");
const Client = require("../models/Client");

// ✅ GET ALL LEADS
const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ isDeleted: false });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ CREATE LEAD
const createLead = async (req, res) => {
  try {
    const {
      name,
      company,
      email,
      username,
      password,
      totalAmount,
      amountPaid,
      remaining,
      assignedTo,
    } = req.body;

    const lead = await Lead.create({
      name: name || company,
      company,
      email,
      username,
      password,
      totalAmount: Number(totalAmount) || 0,
      amountPaid: Number(amountPaid) || 0,
      remaining: Number(remaining) || 0,
      assignedTo,
      history: [{ type: "New", date: new Date(), desc: "Lead created in system." }],
    });

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
    res.status(500).json({ message: "Lead creation failed", error: error.message });
  }
};

// ✅ UPDATE LEAD
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      company,
      email,
      username,
      password,
      totalAmount,
      amountPaid,
      remaining,
      status,
      assignedTo,
    } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // Auto-create client when Confirmed
    if (status === "Confirmed") {
      const existingClient = await Client.findOne({ email: lead.email });
      if (!existingClient) {
        await Client.create({
          name: lead.name,
          email: lead.email,
          revenue: lead.totalAmount || 0,
          lead: lead._id,
        });
      }
    }

    if (name !== undefined) lead.name = name;
    if (company !== undefined) lead.company = company;
    if (email !== undefined) lead.email = email;
    if (username !== undefined) lead.username = username;
    if (password !== undefined) lead.password = password;
    if (totalAmount !== undefined) lead.totalAmount = Number(totalAmount);
    if (amountPaid !== undefined) lead.amountPaid = Number(amountPaid);
    if (remaining !== undefined) lead.remaining = Number(remaining);
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

// ✅ DELETE LEAD (Soft delete)
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    lead.isDeleted = true;
    await lead.save();

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