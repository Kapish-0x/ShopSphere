import { Schema, model } from "mongoose";

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String },

    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    // caps a percentage discount so "50% off" can't blow out on a huge cart — ignored for flat coupons
    maxDiscountAmount: { type: Number },

    minOrderValue: { type: Number, default: 0 },

    // if empty, applies platform-wide; if set, only these stores/categories qualify
    applicableStores: [{ type: Schema.Types.ObjectId, ref: "Store" }],
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: "Category" }],

    usageLimit: { type: Number, default: null }, // null = unlimited total uses
    usageLimitPerUser: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    usedBy: [{ type: Schema.Types.ObjectId, ref: "User" }], // simple tracking for per-user limit checks

    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },

    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // admin who created it
  },
  { timestamps: true }
);

couponSchema.index({ code: 1 });

export const CouponModel = model("Coupon", couponSchema);