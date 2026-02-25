const Lead = require("../models/Lead");
const Notification = require("../models/Notification");
const Task = require("../models/Task");
const AuditLog = require("../models/AuditLog");
const calculateLeadScore = require("../utils/leadScoring");

// 🔹 Get All Leads
const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ isDeleted: false });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Create Lead
const createLead = async (req, res) => {
  try {
    const { name, email, phone, status, assignedTo, value } = req.body;

    const lead = await Lead.create({
      name,
      email,
      phone,
      status: status || "New",
      assignedTo,
      value: value || 0
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: "Lead creation failed", error: error.message });
  }
};

// 🔹 Update Lead
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, value, name } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    if (status !== undefined) lead.status = status;
    if (assignedTo !== undefined) lead.assignedTo = assignedTo;
    if (value !== undefined) lead.value = value;
    if (name !== undefined) lead.name = name;

    if (lead.value) {
      lead.leadScore = calculateLeadScore(lead.value);
    }

    await lead.save();
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// 🔹 Soft Delete Lead
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    lead.isDeleted = true;
    await lead.save();
    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createLead, getAllLeads, updateLead, deleteLead };