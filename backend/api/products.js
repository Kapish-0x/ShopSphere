import { Router } from "express";
import { ProductModel } from "../models/ProductModel.js";
import { StoreModel } from "../models/StoreModel.js";
import { verifyToken, verifyRole } from "../middleware/verifyToken.js";

const router = Router();

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

// GET /api/products — public, list/search/filter with pagination
router.get("/", async (req, res) => {
  try {
    const {
      search,
      category,
      store,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sort = "-createdAt",
    } = req.query;

    const filter = { status: "active", isActive: true };

    if (search) {
      filter.$text = { $search: search }; // uses the text index on title/description/tags
    }
    if (category) filter.category = category;
    if (store) filter.store = store;
    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }

    const products = await ProductModel.find(filter)
      .populate("store", "storeName slug")
      .populate("category", "name slug")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await ProductModel.countDocuments(filter);

    res.status(200).json({
      products,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch products", error: err.message });
  }
});

// GET /api/products/:id — public, product detail
router.get("/:id", async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id)
      .populate("store", "storeName slug logoUrl")
      .populate("category", "name slug");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch product", error: err.message });
  }
});

// POST /api/products — [seller] create product under their own store
router.post("/", verifyToken, verifyRole("seller"), async (req, res) => {
  try {
    const { title, description, category, attributes, variants, tags } = req.body;

    if (!title || !category || !variants || !variants.length) {
      return res.status(400).json({
        message: "title, category, and at least one variant are required",
      });
    }

    const store = await StoreModel.findOne({ seller: req.user._id });
    if (!store) {
      return res.status(400).json({ message: "You must create a store before adding products" });
    }
    if (store.status !== "approved") {
      return res.status(403).json({ message: "Your store must be approved before adding products" });
    }

    let slug = slugify(title);
    const slugExists = await ProductModel.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString().slice(-5)}`;
    }

    // basePrice is denormalized from the lowest variant price for fast catalog display
    const basePrice = Math.min(...variants.map((v) => v.price));

    const product = await ProductModel.create({
      store: store._id,
      category,
      title,
      slug,
      description,
      attributes,
      variants,
      basePrice,
      thumbnailUrl: variants[0]?.imageUrls?.[0],
      tags,
      status: "pending_review", // goes live only after admin approval
    });

    res.status(201).json({ message: "Product created, pending review", product });
  } catch (err) {
    res.status(500).json({ message: "Could not create product", error: err.message });
  }
});

// PATCH /api/products/:id — [seller/owner] update
router.patch("/:id", verifyToken, verifyRole("seller"), async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id).populate("store");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.store.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You do not own this product" });
    }

    const allowedFields = ["title", "description", "attributes", "tags", "category"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // if variants array is passed, replace it and recalc basePrice
    if (req.body.variants) {
      product.variants = req.body.variants;
      product.basePrice = Math.min(...req.body.variants.map((v) => v.price));
    }

    // any edit sends it back for re-review rather than silently changing a live listing
    product.status = "pending_review";

    await product.save();
    res.status(200).json({ message: "Product updated, pending review", product });
  } catch (err) {
    res.status(500).json({ message: "Could not update product", error: err.message });
  }
});

// DELETE /api/products/:id — [seller/owner] soft delete
router.delete("/:id", verifyToken, verifyRole("seller"), async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id).populate("store");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.store.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You do not own this product" });
    }

    product.isActive = false;
    product.status = "archived";
    await product.save();

    res.status(200).json({ message: "Product archived" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete product", error: err.message });
  }
});

// PATCH /api/products/:id/status — [admin] approve/reject
router.patch("/:id/status", verifyToken, verifyRole("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["active", "rejected", "archived"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${validStatuses.join(", ")}` });
    }

    const product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: `Product status set to ${status}`, product });
  } catch (err) {
    res.status(500).json({ message: "Could not update product status", error: err.message });
  }
});

// PATCH /api/products/:id/variants/:variantId/stock — [seller/owner] update stock
router.patch(
  "/:id/variants/:variantId/stock",
  verifyToken,
  verifyRole("seller"),
  async (req, res) => {
    try {
      const { stock } = req.body;

      if (typeof stock !== "number" || stock < 0) {
        return res.status(400).json({ message: "stock must be a non-negative number" });
      }

      const product = await ProductModel.findById(req.params.id).populate("store");
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.store.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You do not own this product" });
      }

      const variant = product.variants.id(req.params.variantId);
      if (!variant) {
        return res.status(404).json({ message: "Variant not found" });
      }

      variant.stock = stock;
      await product.save();

      res.status(200).json({ message: "Stock updated", variant });
    } catch (err) {
      res.status(500).json({ message: "Could not update stock", error: err.message });
    }
  }
);

export default router;