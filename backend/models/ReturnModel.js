import { Schema, model } from "mongoose";

const returnSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    subOrder: { type: Schema.Types.ObjectId, required: true }, // subdocument _id within order.subOrders
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    store: { type: Schema.Types.ObjectId, ref: "Store", required: true },

    // which specific items from the suborder are being returned (partial returns supported)
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        variantId: { type: Schema.Types.ObjectId, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],

    reason: { type: String, required: true },
    description: { type: String },
    imageUrls: [{ type: String }], // proof photos, e.g. damaged item

    status: {
      type: String,
      enum: ["requested", "approved", "rejected", "picked_up", "refunded"],
      default: "requested",
    },

    refundAmount: { type: Number },
    resolutionNote: { type: String }, // seller/admin's note on approval or rejection

    handledBy: { type: Schema.Types.ObjectId, ref: "User" }, // seller or support agent who processed it
  },
  { timestamps: true }
);

returnSchema.index({ order: 1 });
returnSchema.index({ customer: 1 });
returnSchema.index({ status: 1 });

export const ReturnModel = model("Return", returnSchema);