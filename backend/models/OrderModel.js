import { Schema, model } from "mongoose";

// Snapshot of what was actually bought — never references live Product data,
// so the order stays accurate even if the seller edits/deletes the product later.
const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    sku: { type: String, required: true },
    variantAttributes: { type: Map, of: String },
    imageUrl: { type: String },
    price: { type: Number, required: true }, // price per unit at time of order
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const statusHistorySchema = new Schema(
  {
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: "User" },
    note: { type: String },
  },
  { _id: false }
);

// One suborder = one seller's portion of a customer's single checkout.
// This is what actually moves through the fulfillment lifecycle.
const subOrderSchema = new Schema(
  {
    store: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    items: { type: [orderItemSchema], required: true },

    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    status: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
        "refunded",
      ],
      default: "placed",
    },
    statusHistory: { type: [statusHistorySchema], default: [] },

    deliveryPartner: { type: Schema.Types.ObjectId, ref: "User", default: null },
    trackingId: { type: String },

    cancelReason: { type: String },
    returnReason: { type: String },
  },
  { timestamps: true }
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },

    shippingAddress: {
      label: String,
      line1: { type: String, required: true },
      line2: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: "India" },
      phone: String,
    },

    // one checkout, split into per-seller suborders — this is the core
    // multi-vendor mechanic. Each suborder has its own independent status.
    subOrders: { type: [subOrderSchema], required: true },

    appliedCoupon: { type: Schema.Types.ObjectId, ref: "Coupon", default: null },
    couponDiscount: { type: Number, default: 0 },

    grandTotal: { type: Number, required: true },

    payment: {
      method: { type: String, enum: ["cod", "card", "upi", "netbanking"], default: "cod" },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      transactionId: { type: String },
      paidAt: { type: Date },
    },
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ "subOrders.store": 1 });
orderSchema.index({ "subOrders.status": 1 });

export const OrderModel = model("Order", orderSchema);