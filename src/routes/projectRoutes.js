const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");

// IMPORTANT: revenue route BEFORE :id
router.get("/revenue/total", projectController.getProjectRevenue);

router.put(
  "/:projectId/installment/:installmentIndex",
  projectController.markInstallmentPaid
);

router.put(
  "/:projectId/installment/:installmentIndex",
  projectController.markInstallmentPaid
);
router.get("/:id", projectController.getProjectById);

router.post("/", projectController.createProject);

router.put("/:id", projectController.updateProject);

router.delete("/:id", projectController.deleteProject);

router.put("/installment/undo", projectController.undoInstallmentPayment);

module.exports = router;