const Lead = require("../models/Lead");
const Notification = require("../models/Notification");
const Task = require("../models/Task");
const AuditLog = require("../models/AuditLog");
const calculateLeadScore = require("../utils/leadScoring");


// ✅ GET ALL LEADS
const getAllLeads = async (req, res) => {

  try {

    const leads = await Lead.find({ isDeleted: false });

    res.json(leads);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



// ✅ CREATE LEAD
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


    // notification
    if (req.user) {

      await Notification.create({

        userId: req.user.id,
        title: "New Lead Created",
        message: `${lead.name} was added`,
        type: "lead"

      });

    }

    res.status(201).json(lead);

  }

  catch (error) {

    res.status(500).json({

      message: "Lead creation failed",
      error: error.message

    });

  }

};




// ✅ UPDATE LEAD
const updateLead = async (req, res) => {

  try {

    const { id } = req.params;

    const lead = await Lead.findById(id);

    if (!lead)
      return res.status(404).json({ message: "Lead not found" });


    Object.assign(lead, req.body);


    if (lead.value)
      lead.leadScore = calculateLeadScore(lead.value);


    await lead.save();


    if (req.user) {

      await Notification.create({

        userId: req.user.id,
        title: "Lead Updated",
        message: `${lead.name} was updated`,
        type: "lead"

      });

    }


    res.json(lead);

  }

  catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

};




// ✅ DELETE LEAD
const deleteLead = async (req, res) => {

  try {

    const lead = await Lead.findById(req.params.id);

    if (!lead)
      return res.status(404).json({ message: "Lead not found" });


    lead.isDeleted = true;

    await lead.save();


    if (req.user) {

      await Notification.create({

        userId: req.user.id,
        title: "Lead Deleted",
        message: `${lead.name} was deleted`,
        type: "lead"

      });

    }

// ✅ REALTIME EMIT
global.io
.to(req.user.id.toString())
.emit("notification", notification);

    res.json({

      message: "Lead deleted successfully"

    });

  }

  catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

};




module.exports = {

  createLead,
  getAllLeads,
  updateLead,
  deleteLead

};