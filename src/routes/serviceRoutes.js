const express = require("express");
const router = express.Router();

const serviceController = require("../controllers/serviceController");

// CREATE SERVICE
router.post("/", serviceController.createService);

// GET CLIENT SERVICES
router.get("/:clientId", serviceController.getServicesByClient);
router.put("/:id", serviceController.updateService);
router.delete("/:id", serviceController.deleteService);
module.exports = router;