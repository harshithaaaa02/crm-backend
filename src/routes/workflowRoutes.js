const express = require("express");
const router = express.Router();

// example test route
router.get("/", (req, res) => {
  res.json({
    message: "Workflow routes working"
  });
});

module.exports = router;