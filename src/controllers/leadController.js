const Lead = require("../models/Lead");
const Notification = require("../models/Notification");
const Client = require("../models/Client");
const calculateLeadScore = require("../utils/leadScoring");

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
      projectName,
      phone,
      status,
      assignedTo,
      value,
      totalAmount,
      amountPaid,
      remaining,
    } = req.body;

    const finalStatus = status || "New";
    const finalValue =
      value !== undefined
        ? Number(value) || 0
        : totalAmount !== undefined
        ? Number(totalAmount) || 0
        : 0;

    const lead = await Lead.create({
      name: name || company,
      company: company || "",
      email,
      username,
      password,
      projectName: projectName || "",
      phone,
      status: finalStatus,
      assignedTo,
      value: finalValue,
      totalAmount: totalAmount !== undefined ? Number(totalAmount) || 0 : finalValue,
      amountPaid: amountPaid !== undefined ? Number(amountPaid) || 0 : 0,
      remaining:
        remaining !== undefined
          ? Number(remaining) || 0
          : totalAmount !== undefined
          ? (Number(totalAmount) || 0) - (Number(amountPaid) || 0)
          : 0,
      leadScore: calculateLeadScore(finalValue),
      history: [
        {
          type: finalStatus,
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
    const {
      name,
      company,
      email,
      username,
      password,
      projectName,
      phone,
      totalAmount,
      amountPaid,
      remaining,
      status,
      assignedTo,
      value,
    } = req.body;

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

    // ✅ auto create client when Confirmed
    if (status === "Confirmed") {
      const existingClient = await Client.findOne({ email: email || lead.email });

      if (!existingClient) {
        await Client.create({
          name: company || lead.company || name || lead.name,
          email: email || lead.email,
          revenue:
            totalAmount !== undefined
              ? Number(totalAmount) || 0
              : value !== undefined
              ? Number(value) || 0
              : lead.totalAmount || lead.value || 0,
          lead: lead._id,
        });
      }
    }

    if (name !== undefined) lead.name = name;
    if (company !== undefined) lead.company = company;
    if (email !== undefined) lead.email = email;
    if (username !== undefined) lead.username = username;
    if (password !== undefined) lead.password = password;
    if (projectName !== undefined) lead.projectName = projectName;
    if (phone !== undefined) lead.phone = phone;
    if (assignedTo !== undefined) lead.assignedTo = assignedTo;

    if (value !== undefined) {
      lead.value = Number(value) || 0;
      lead.leadScore = calculateLeadScore(Number(value) || 0);
    }

    if (totalAmount !== undefined) lead.totalAmount = Number(totalAmount) || 0;
    if (amountPaid !== undefined) lead.amountPaid = Number(amountPaid) || 0;

    if (remaining !== undefined) {
      lead.remaining = Number(remaining) || 0;
    } else if (totalAmount !== undefined || amountPaid !== undefined) {
      const finalTotal =
        totalAmount !== undefined
          ? Number(totalAmount) || 0
          : Number(lead.totalAmount) || 0;

      const finalPaid =
        amountPaid !== undefined
          ? Number(amountPaid) || 0
          : Number(lead.amountPaid) || 0;

      lead.remaining = finalTotal - finalPaid;
    }

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

    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLead,
  getAllLeads,
  updateLead,
  deleteLead,
};