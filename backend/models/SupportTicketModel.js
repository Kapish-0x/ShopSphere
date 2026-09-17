import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const supportTicketSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["order_issue", "refund", "product_question", "account", "general"],
      default: "general",
    },

    // optional links to give the support agent context
    relatedOrder: { type: Schema.Types.ObjectId, ref: "Order" },
    relatedReturn: { type: Schema.Types.ObjectId, ref: "Return" },

    messages: { type: [messageSchema], default: [] },

    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null }, // a support agent
  },
  { timestamps: true }
);

supportTicketSchema.index({ customer: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ assignedTo: 1 });

export const SupportTicketModel = model("SupportTicket", supportTicketSchema);