import { Router } from "express";
import { SupportTicketModel } from "../models/SupportTicketModel.js";
import { verifyToken, verifyRole } from "../middleware/verifyToken.js";

const router = Router();

// POST /api/support — [customer] create a ticket
router.post("/", verifyToken, verifyRole("customer"), async (req, res) => {
  try {
    const { subject, category, relatedOrder, relatedReturn, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: "subject and an initial message are required" });
    }

    const ticket = await SupportTicketModel.create({
      customer: req.user._id,
      subject,
      category,
      relatedOrder,
      relatedReturn,
      messages: [{ sender: req.user._id, text: message }],
    });

    res.status(201).json({ message: "Support ticket created", ticket });
  } catch (err) {
    res.status(500).json({ message: "Could not create ticket", error: err.message });
  }
});

// GET /api/support — role-aware: customer sees own, support/admin see all (or assigned only)
router.get("/", verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    if (req.user.role === "customer") {
      filter = { customer: req.user._id };
    } else if (req.user.role === "support") {
      filter = { $or: [{ assignedTo: req.user._id }, { assignedTo: null }] };
    }
    // admin sees everything

    if (status) filter.status = status;

    const tickets = await SupportTicketModel.find(filter)
      .populate("customer", "name email")
      .populate("assignedTo", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ tickets });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch tickets", error: err.message });
  }
});

// GET /api/support/:id
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const ticket = await SupportTicketModel.findById(req.params.id)
      .populate("customer", "name email")
      .populate("assignedTo", "name")
      .populate("messages.sender", "name role");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (
      req.user.role === "customer" &&
      ticket.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "This is not your ticket" });
    }

    res.status(200).json({ ticket });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch ticket", error: err.message });
  }
});

// POST /api/support/:id/messages — customer or support/admin can reply
router.post("/:id/messages", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "text is required" });
    }

    const ticket = await SupportTicketModel.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (
      req.user.role === "customer" &&
      ticket.customer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "This is not your ticket" });
    }

    ticket.messages.push({ sender: req.user._id, text });

    // if a support agent replies to an open ticket, auto-move it to in_progress
    if (["support", "admin"].includes(req.user.role) && ticket.status === "open") {
      ticket.status = "in_progress";
    }

    await ticket.save();
    res.status(200).json({ message: "Message added", ticket });
  } catch (err) {
    res.status(500).json({ message: "Could not add message", error: err.message });
  }
});

// PATCH /api/support/:id/assign — [admin] assign to a support agent
router.patch("/:id/assign", verifyToken, verifyRole("admin"), async (req, res) => {
  try {
    const { supportAgentId } = req.body;

    const ticket = await SupportTicketModel.findByIdAndUpdate(
      req.params.id,
      { assignedTo: supportAgentId, status: "in_progress" },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ message: "Ticket assigned", ticket });
  } catch (err) {
    res.status(500).json({ message: "Could not assign ticket", error: err.message });
  }
});

// PATCH /api/support/:id/status — [support/admin] update status
router.patch("/:id/status", verifyToken, verifyRole("support", "admin"), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["open", "in_progress", "resolved", "closed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${validStatuses.join(", ")}` });
    }

    const ticket = await SupportTicketModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ message: `Ticket status set to ${status}`, ticket });
  } catch (err) {
    res.status(500).json({ message: "Could not update ticket status", error: err.message });
  }
});

export default router;