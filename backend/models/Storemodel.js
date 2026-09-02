import { Schema,model } from "mongoose";

const storeSchema = new Schema(
    {
        seller: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        storeName: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        description: { type: String, trim: true },
        logoUrl: { type: String },
        bannerUrl: { type: String },

        contactEmail: { type: String, trim: true, lowercase: true },
        contactPhone: { type: String, trim: true },

        address: {
            line1: String,
            city: String,
            state: String,
            pincode: String,
            country: { type: String, default: "India" },
        },

        status: {
            type: String, 
            enum: ["pending", "approved", "rejected", "suspended"],
            default: "pending",
        },

        stats: {
            totalProducts: { type: Number, default: 0 },
            totalOrders: { type: Number, default: 0 },
            totalRevenue: { type: Number, deafult: 0 },
            averageRating: { type: String, default: 0 },
            ratingCount: { type: String, default: 0 },
        },

        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

storeSchema.index({ slug: 1 });
storeSchema.index({ status: 1 });

export const StoreModel = model("Store", storeSchema);