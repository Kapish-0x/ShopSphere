import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, trim: true },
    imageUrl: { type: String },

    // Supports nested categories, e.g. Electronics > Mobiles > Smartphones
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });

export const CategoryModel = model("Category", categorySchema);