const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { protect } = require("../middlewares/authMiddleware");

// Revenue (BEFORE :id to avoid conflict)
router.get("/revenue/total", protect, projectController.getProjectRevenue);

// Projects
router.get("/", protect, projectController.getProjects);
router.post("/", protect, projectController.createProject);
router.get("/:id", protect, projectController.getProjectById);
router.put("/:id", protect, projectController.updateProject);
router.delete("/:id", protect, projectController.deleteProject);

// Installments
router.put("/:projectId/installment/:installmentIndex", protect, projectController.markInstallmentPaid);
router.put("/installment/undo", protect, projectController.undoInstallmentPayment);
router.put("/:projectId/toggle/:index", protect, projectController.toggleInstallment);

// Messages
router.get("/:projectId/messages", protect, projectController.getMessages);
router.post("/:projectId/messages", protect, projectController.addMessage);

// Documents
router.get("/:projectId/documents", protect, projectController.getDocuments);
router.post("/:projectId/documents", protect, projectController.addDocument);
router.delete("/:projectId/documents/:documentId", protect, projectController.deleteDocument);

module.exports = router;