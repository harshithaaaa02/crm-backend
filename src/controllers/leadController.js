const Lead = require("../models/Lead");
const Notification = require("../models/Notification");
const Task = require("../models/Task");
const AuditLog = require("../models/AuditLog");
const calculateLeadScore = require("../utils/leadScoring");

/**
 * 🔹 Get All Leads
 * Fetches leads that are not marked as deleted.
 */
const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ isDeleted: false });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 🔹 Create Lead
 * Initializes a new lead and records its first milestone in history.
 */
const createLead = async (req, res) => {
  try {
    const { name, email, phone, status, assignedTo, value } = req.body;

    const lead = await Lead.create({
      name,
      email,
      phone,
      status: status || "New",
      assignedTo,
      value: value || 0,
      history: [{
        type: status || "New",
        date: new Date(),
        desc: "Lead created in system."
      }]
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: "Lead creation failed", error: error.message });
  }
};

/**
 * 🔹 Update Lead
 * FIXED: Ensures history is recorded whenever status changes.
 */
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, value, name } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // 🔹 Record History (Past & Present Lifecycle)
    // Only triggers if the status is actually different
    if (status !== undefined && status !== lead.status) {
      lead.history.push({
        type: status,
        date: new Date(),
        desc: `Lead moved to ${status} stage.`
      });
      lead.status = status;
    }

    if (assignedTo !== undefined) lead.assignedTo = assignedTo;
    if (value !== undefined) lead.value = value;
    if (name !== undefined) lead.name = name;

    // Update lead score based on value changes
    if (lead.value) {
      lead.leadScore = calculateLeadScore(lead.value);
    }

    // Await is now valid because the function is correctly marked 'async'
    await lead.save(); 
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

/**
 * 🔹 Soft Delete Lead
 */
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    lead.isDeleted = true;
    await lead.save(); // Save the soft delete status
    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createLead, getAllLeads, updateLead, deleteLead };