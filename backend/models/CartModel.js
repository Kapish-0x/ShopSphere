import { Schema, model } from "mongoose";

const cartItemSchema = new Schema (
    {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        variantId: { type: Schema.Types.ObjectId, required: true },
        store: { type: Schema.Types.ObjectId, ref: "Store", required: true },
        quantity: { type: Number, required: true, min: 1, default: 1 },
        priceAtAdd: { type: Number, rewuired: true },
    },
    { timestamps: true }
);

const cartSchema = new Schema (
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        items: [cartItemSchema],
        appliedCoupon: { type: Schema.Types.ObjectId, ref: "Coupon", default: null },
    },
    { timestamps: true }
);

export const CartModel = model("Cart", cartSchema);