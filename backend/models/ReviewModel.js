import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // proves this is a genuine "verified purchase" review, not a random submission
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    comment: { type: String, trim: true },
    imageUrls: [{ type: String }],

    sellerReply: {
      text: { type: String },
      repliedAt: { type: Date },
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // moderation queue before it shows publicly
    },
    moderationNote: { type: String },

    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// a customer can only review a specific product once per order
reviewSchema.index({ product: 1, customer: 1, order: 1 }, { unique: true });
reviewSchema.index({ status: 1 });

export const ReviewModel = model("Review", reviewSchema);