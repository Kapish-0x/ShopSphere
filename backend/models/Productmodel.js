import { Schema, model } from "mongoose";

// A variant represents a specific buyable version of a product (e.g. Size M / Red)
// Inventory is embedded directly in the variant — simplest correct approach
// for this project's scale. Stock updates happen atomically via $inc on this field.
const variantSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true },
    attributes: {
      // flexible key-value pairs, e.g. { size: "M", color: "Red" }
      type: Map,
      of: String,
      default: {},
    },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 }, // "original" price for showing discounts
    stock: { type: Number, required: true, default: 0, min: 0 },
    reservedStock: { type: Number, default: 0, min: 0 }, // held during checkout, released/committed on order state change
    imageUrls: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { _id: true, timestamps: true }
);

const productSchema = new Schema(
  {
    store: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },

    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, trim: true },

    // Structured attributes used both for display and for the AI description generator
    attributes: {
      type: Map,
      of: String,
      default: {},
    },

    variants: {
      type: [variantSchema],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },

    // Denormalized for fast catalog listing without joining variants every time
    basePrice: { type: Number, required: true, min: 0 },
    thumbnailUrl: { type: String },

    tags: [{ type: String, trim: true, lowercase: true }],

    // AI-generated fields
    aiGeneratedDescription: { type: String },
    aiKeySellingPoints: [{ type: String }],
    searchEmbedding: { type: [Number], select: false }, // vector for semantic search

    status: {
      type: String,
      enum: ["draft", "pending_review", "active", "rejected", "archived"],
      default: "draft",
    },

    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 });
productSchema.index({ store: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ title: "text", description: "text", tags: "text" });

export const ProductModel = model("Product", productSchema);