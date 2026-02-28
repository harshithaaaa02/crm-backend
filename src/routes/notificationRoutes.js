const express = require("express");
const router = express.Router();

const {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead
} = require("../controllers/notificationController");

const { protect } =
require("../middlewares/authMiddleware");

router.get("/:userId", protect, getUserNotifications);

router.put("/read/:id", protect, markAsRead);

router.put(
  "/read-all/:userId",
  protect,
  markAllAsRead
);

module.exports = router;