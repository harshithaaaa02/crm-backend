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
    const { name, email, phone, status, assignedTo } = req.body;

    const lead = await Lead.create({
      name,
      email,
      phone,
      status,
      assignedTo
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: "Lead creation failed", error: error.message });
  }
};


// 🔹 Update Lead (AI + Workflow + Audit)
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, value } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const oldStatus = lead.status;

    if (status !== undefined) lead.status = status;
    if (assignedTo !== undefined) lead.assignedTo = assignedTo;
    if (value !== undefined) lead.value = value;

    // 🔥 AI Lead Scoring Logic
lead.leadScore = calculateLeadScore(lead.value);


    // 🔥 Smart Follow-up Timing
    let followUpDays;
    if (lead.leadScore >= 80) followUpDays = 2;
    else if (lead.leadScore >= 60) followUpDays = 5;
    else followUpDays = 10;

    lead.nextFollowUpDate = new Date(Date.now() + followUpDays * 24 * 60 * 60 * 1000);

    const sendEmail = require("../utils/emailService");

if (lead.status === "Qualified") {
  await sendEmail(
    lead.email,
    "Lead Qualified",
    `Hello ${lead.name}, our team will contact you soon.`
  );
}


    // 🔥 Automatic Task Creation
    if (oldStatus !== "Qualified" && lead.status === "Qualified") {
      const existingTask = await Task.findOne({
        leadId: lead._id,
        title: "Follow up with Qualified Lead"
      });

      if (!existingTask) {
        await Task.create({
          title: "Follow up with Qualified Lead",
          description: `Contact ${lead.name} and move to next sales stage.`,
          leadId: lead._id,
          assignedTo: lead.assignedTo,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        });
      }
    }

    // 🔥 Notification
    if (oldStatus !== status && (assignedTo || lead.assignedTo)) {
      await Notification.create({
        userId: assignedTo || lead.assignedTo,
        title: "Lead Status Updated",
        message: `Lead status changed from ${oldStatus} to ${status}`,
        type: "lead"
      });
    }

    // 🔥 SAVE Lead
    await lead.save();

    // 🔥 Audit Logging
    await AuditLog.create({
      action: "UPDATE",
      entity: "Lead",
      entityId: lead._id,
      performedBy: lead.assignedTo || null
    });

    res.json(lead);

  } catch (error) {
    console.error("UPDATE LEAD ERROR:", error);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};


// 🔹 Soft Delete Lead
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    lead.isDeleted = true;
    await lead.save();

    res.json({ message: "Lead soft deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  createLead,
  getAllLeads,
  updateLead,
  deleteLead
};