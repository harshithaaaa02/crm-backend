const Project = require("../models/Project");
const Client = require("../models/Client");

// ✅ GET SINGLE PROJECT
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("client");

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    res.json(project);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ CREATE PROJECT
exports.createProject = async (req, res) => {
  try {
    const {
      name,
      handledBy,
      totalPayment,
      deadline,
      clientId,
      phase1Percent,
      phase2Percent,
      phase3Percent
    } = req.body;
const totalPercent =
  Number(phase1Percent) +
  Number(phase2Percent) +
  Number(phase3Percent);

if (totalPercent !== 100) {
  return res.status(400).json({
    message: "Installment percentages must equal 100%"
  });
}
const p1 = (Number(phase1Percent) / 100) * Number(totalPayment);
const p2 = (Number(phase2Percent) / 100) * Number(totalPayment);
const p3 = (Number(phase3Percent) / 100) * Number(totalPayment);
    const project = await Project.create({
      name,
      handledBy,
      totalPayment,
      deadline,
      client: clientId,
      installments: [
        { phase: "Advance", percentage: phase1Percent, amount: p1 },
        { phase: "Middle", percentage: phase2Percent, amount: p2 },
        { phase: "Deployment", percentage: phase3Percent, amount: p3 }
      ]
    });

    await Client.findByIdAndUpdate(clientId, {
      $push: { projects: project._id }
    });

    res.status(201).json(project);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ UPDATE PROJECT
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    res.json(project);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ DELETE PROJECT
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    await Client.findByIdAndUpdate(project.client, {
      $pull: { projects: project._id }
    });

    await project.deleteOne();

    res.json({ message: "Project deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ TOTAL REVENUE
exports.getProjectRevenue = async (req, res) => {
  try {
    const projects = await Project.find();

    const totalRevenue = projects.reduce(
      (sum, p) => sum + (p.paidAmount || 0),
      0
    );

    res.json({ totalRevenue });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markInstallmentPaid = async (req, res) => {
  try {

    const { projectId, installmentIndex } = req.params;

    const project = await Project.findById(projectId);

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    if (!project.installments[installmentIndex])
      return res.status(400).json({ message: "Invalid installment index" });

    project.installments[installmentIndex].paid = true;
    project.installments[installmentIndex].paidAt = new Date();

    await project.save();

    res.json(project);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.updateProject = async (req, res) => {
  try {
    const { name, handledBy, totalPayment, deadline } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    project.name = name ?? project.name;
    project.handledBy = handledBy ?? project.handledBy;
    project.totalPayment = totalPayment ?? project.totalPayment;
    project.deadline = deadline ?? project.deadline;

    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.undoInstallmentPayment = async (req, res) => {
  try {
    const { projectId, installmentIndex } = req.body;

    const project = await Project.findById(projectId);

    project.installments[installmentIndex].paid = false;

    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleInstallment = async (req, res) => {
  try {
    const { projectId, index } = req.params;

    const project = await Project.findById(projectId);

    project.installments[index].paid =
      !project.installments[index].paid;

    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};