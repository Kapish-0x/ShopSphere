import { Router } from "express";
import { AuditLogModel } from "../models/AuditLogModel.js";
import { verifyToken, verifyRole } from "../middleware/verifyToken.js";

const router = Router();

// GET /api/audit-logs — [admin] view platform activity trail
router.get("/", verifyToken, verifyRole("admin"), async (req, res) => {
  try {
    const { action, targetType, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (targetType) filter.targetType = targetType;

    const logs = await AuditLogModel.find(filter)
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await AuditLogModel.countDocuments(filter);

    res.status(200).json({ logs, pagination: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch audit logs", error: err.message });
  }
});

export default router;