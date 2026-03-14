const Project = require("../models/Project");
const Client = require("../models/Client");

// ✅ GET ALL PROJECTS (supports ?clientId= filter, excludes deleted)
exports.getProjects = async (req, res) => {
  try {
    const filter = { isDeleted: false };
    if (req.query.clientId) filter.client = req.query.clientId;

    const projects = await Project.find(filter).populate("client");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET SINGLE PROJECT
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("client");
    if (!project || project.isDeleted)
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
      name, handledBy, totalPayment, deadline, clientId,
      phase1Percent, phase2Percent, phase3Percent,
    } = req.body;

    const totalPercent =
      Number(phase1Percent) + Number(phase2Percent) + Number(phase3Percent);

    if (totalPercent !== 100) {
      return res.status(400).json({ message: "Installment percentages must equal 100%" });
    }

    const p1 = (Number(phase1Percent) / 100) * Number(totalPayment);
    const p2 = (Number(phase2Percent) / 100) * Number(totalPayment);
    const p3 = (Number(phase3Percent) / 100) * Number(totalPayment);

    const project = await Project.create({
      name, handledBy, totalPayment, deadline,
      client: clientId,
      stage: "Intake",
      installments: [
        { phase: "Advance", percentage: phase1Percent, amount: p1 },
        { phase: "Middle", percentage: phase2Percent, amount: p2 },
        { phase: "Deployment", percentage: phase3Percent, amount: p3 },
      ],
    });

    await Client.findByIdAndUpdate(clientId, { $push: { projects: project._id } });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE PROJECT
exports.updateProject = async (req, res) => {
  try {
    const { name, handledBy, totalPayment, deadline, stage } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project || project.isDeleted)
      return res.status(404).json({ message: "Project not found" });

    project.name = name ?? project.name;
    project.handledBy = handledBy ?? project.handledBy;
    project.totalPayment = totalPayment ?? project.totalPayment;
    project.deadline = deadline ?? project.deadline;
    if (stage !== undefined) project.stage = stage;

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE PROJECT (soft delete)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.isDeleted = true;
    await project.save();

    await Client.findByIdAndUpdate(project.client, {
      $pull: { projects: project._id },
    });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ TOTAL REVENUE
exports.getProjectRevenue = async (req, res) => {
  try {
    const projects = await Project.find({ isDeleted: false });
    const totalRevenue = projects.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
    res.json({ totalRevenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ MARK INSTALLMENT PAID
exports.markInstallmentPaid = async (req, res) => {
  try {
    const { projectId, installmentIndex } = req.params;
    const project = await Project.findById(projectId);

    if (!project) return res.status(404).json({ message: "Project not found" });
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

// ✅ UNDO INSTALLMENT PAYMENT
exports.undoInstallmentPayment = async (req, res) => {
  try {
    const { projectId, installmentIndex } = req.body;
    const project = await Project.findById(projectId);

    project.installments[installmentIndex].paid = false;
    project.installments[installmentIndex].paidAt = null;

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ TOGGLE INSTALLMENT
exports.toggleInstallment = async (req, res) => {
  try {
    const { projectId, index } = req.params;
    const project = await Project.findById(projectId);

    project.installments[index].paid = !project.installments[index].paid;
    if (project.installments[index].paid) {
      project.installments[index].paidAt = new Date();
    } else {
      project.installments[index].paidAt = null;
    }

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ADD MESSAGE
exports.addMessage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { from, text } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.messages.push({ from, text });
    await project.save();

    res.json(project.messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET MESSAGES
exports.getMessages = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project.messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ADD DOCUMENT
exports.addDocument = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, url } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.documents.push({ name, url });
    await project.save();

    res.json(project.documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET DOCUMENTS
exports.getDocuments = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project.documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE DOCUMENT
exports.deleteDocument = async (req, res) => {
  try {
    const { projectId, documentId } = req.params;
    const project = await Project.findById(projectId);

    project.documents = project.documents.filter(
      (d) => d._id.toString() !== documentId
    );

    await project.save();
    res.json(project.documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
