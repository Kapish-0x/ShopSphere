import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    type: {
      type: String,
      enum: [
        "order_status",
        "return_status",
        "review_reply",
        "store_status",
        "product_status",
        "support_reply",
        "general",
      ],
      required: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    // generic pointer back to whatever triggered this (order id, return id, etc.)
    relatedId: { type: Schema.Types.ObjectId },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export const NotificationModel = model("Notification", notificationSchema);