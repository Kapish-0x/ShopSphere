import { Router } from "express";
import { NotificationModel } from "../models/NotificationModel.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

// GET /api/notifications — current user's notifications
router.get("/", verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const filter = { user: req.user._id };
    if (unreadOnly === "true") filter.isRead = false;

    const notifications = await NotificationModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const unreadCount = await NotificationModel.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.status(200).json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch notifications", error: err.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", verifyToken, async (req, res) => {
  try {
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Marked as read", notification });
  } catch (err) {
    res.status(500).json({ message: "Could not update notification", error: err.message });
  }
});

// PATCH /api/notifications/read-all
router.patch("/read-all", verifyToken, async (req, res) => {
  try {
    await NotificationModel.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Could not update notifications", error: err.message });
  }
});

export default router;