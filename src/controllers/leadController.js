const Lead = require("../models/Lead");
const Notification = require("../models/Notification");
const Task = require("../models/Task");
const AuditLog = require("../models/AuditLog");
const calculateLeadScore = require("../utils/leadScoring");
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
      email,
      company,
      projectName,
      phone,
      status,
      assignedTo,
      value,
    } = req.body;

    const lead = await Lead.create({
      name,
      email,
      company: company || "",
      projectName: projectName || "",
      phone,
      status: status || "New",
      assignedTo,
      value: value || 0,
      leadScore: calculateLeadScore(value || 0),
      history: [
        {
          type: status || "New",
          date: new Date(),
          desc: "Lead created in system.",
        },
      ],
    });

    if (req.user) {
      const notification = await Notification.create({
        userId: req.user.id,
        title: "Lead Created",
        message: `${lead.name} was created`,
        type: "lead",
      });

      if (global.io) {
        global.io.to(req.user.id.toString()).emit("notification", notification);
      }
    }

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({
      message: "Lead creation failed",
      error: error.message,
    });
  }
};

// ✅ UPDATE LEAD
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, value, name, email, company, projectName } =
      req.body;

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // ✅ status history + actual status update
    if (status && status !== lead.status) {
      lead.history.push({
        type: status,
        date: new Date(),
        desc: `Lead moved to ${status}`,
      });
      lead.status = status;
    }

    // ✅ auto create client when confirmed
    if (status === "Confirmed") {
      const existingClient = await Client.findOne({ email: lead.email });

      if (!existingClient) {
        await Client.create({
          name: company || lead.company || lead.name,
          email: email || lead.email,
          revenue: value !== undefined ? value : lead.value || 0,
          lead: lead._id,
        });
      }
    }

    if (assignedTo !== undefined) lead.assignedTo = assignedTo;

    if (value !== undefined) {
      lead.value = value;
      lead.leadScore = calculateLeadScore(value);
    }

    if (name !== undefined) lead.name = name;
    if (email !== undefined) lead.email = email;
    if (company !== undefined) lead.company = company;
    if (projectName !== undefined) lead.projectName = projectName;

    await lead.save();

    if (req.user) {
      const notification = await Notification.create({
        userId: req.user.id,
        title: "Lead Updated",
        message: `${lead.name} was updated to ${lead.status}`,
        type: "lead",
      });

      if (global.io) {
        global.io.to(req.user.id.toString()).emit("notification", notification);
      }
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({
      message: "Update failed",
      error: error.message,
    });
  }
};

// ✅ DELETE LEAD
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    lead.isDeleted = true;
    await lead.save();

    if (req.user) {
      const notification = await Notification.create({
        userId: req.user.id,
        title: "Lead Deleted",
        message: `${lead.name} was deleted`,
        type: "lead",
      });

      if (global.io) {
        global.io.to(req.user.id.toString()).emit("notification", notification);
      }
    }

    res.json({
      message: "Lead deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createLead,
  getAllLeads,
  updateLead,
  deleteLead,
};