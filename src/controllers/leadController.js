const Lead = require("../models/Lead");
const Notification = require("../models/Notification");
const Task = require("../models/Task");

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
    res.status(500).json({
      message: "Lead creation failed",
      error: error.message
    });
  }
};

// 🔹 Update Lead
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, value } = req.body;


    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const oldStatus = lead.status;

    if (status !== undefined) {
  lead.status = status;
}

if (assignedTo !== undefined) {
  lead.assignedTo = assignedTo;
}
if (value !== undefined) {
  lead.value = value;
}

// 🔥 AI Lead Scoring Logic
if (lead.value > 10000) {
  lead.leadScore = 90;
} else if (lead.value > 5000) {
  lead.leadScore = 70;
} else {
  lead.leadScore = 40;
}


    // Automatic Task Creation when lead becomes Qualified
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

    console.log("Task created automatically for qualified lead");
  }
}



if (oldStatus !== status && (assignedTo || lead.assignedTo)) {

      await Notification.create({
        userId: assignedTo || lead.assignedTo,
        title: "Lead Status Updated",
        message: `Lead status changed from ${oldStatus} to ${status}`,
        type: "lead"
      });
    }

    res.json(lead);

  } catch (error) {
  console.error("UPDATE LEAD ERROR:", error);
  res.status(500).json({
    message: "Update failed",
    error: error.message
  });
}

};


module.exports = {
  getAllLeads,
  createLead,
  updateLead
};
