import { NotificationModel } from "./NotificationModel.js";

// Small shared helper — creates a notification doc.
// Lives next to NotificationModel since it's pure model-layer logic,
// imported wherever something needs to notify a user (orders, returns, reviews, etc.)
export const notifyUser = async ({ userId, type, title, message, relatedId }) => {
  try {
    await NotificationModel.create({ user: userId, type, title, message, relatedId });
  } catch (err) {
    // notifications should never break the main action (e.g. an order status update)
    // if they fail, so we just log it instead of throwing
    console.error("Failed to create notification:", err.message);
  }
};