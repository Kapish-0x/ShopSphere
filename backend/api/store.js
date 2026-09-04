import { Router } from "express";
import { StoreModel } from "../models/StoreModel.js";
import { ProductModel } from "../models/ProductModel.js";
import { UserModel } from "../models/UserModel.js";
import { verifyToken, verifyRole } from "../middleware/verifyToken.js";

const router = Router();

// simple slug generator — lowercases, replaces spaces/special chars with hyphens
const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

// POST /api/stores — [seller] create store, triggers approval flow
router.post("/", verifyToken, verifyRole("seller"), async (req, res) => {
  try {
    const { storeName, description, contactEmail, contactPhone, address } =
      req.body;

    if (!storeName) {
      return res.status(400).json({ message: "storeName is required" });
    }

    // one store per seller — check if they already have one
    const existingStore = await StoreModel.findOne({ seller: req.user._id });
    if (existingStore) {
      return res.status(409).json({ message: "You already have a store" });
    }

    let slug = slugify(storeName);
    const slugExists = await StoreModel.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString().slice(-5)}`; // make unique if collision
    }

    const store = await StoreModel.create({
      seller: req.user._id,
      storeName,
      slug,
      description,
      contactEmail,
      contactPhone,
      address,
      status: "pending", // requires admin approval before going live
    });

    // link store back to the seller's profile
    await UserModel.findByIdAndUpdate(req.user._id, {
      "sellerProfile.storeId": store._id,
    });

    res.status(201).json({ message: "Store created, pending approval", store });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not create store", error: err.message });
  }
});

// GET /api/stores — public, list approved stores only
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const filter = { status: "approved", isActive: true };
    if (search) {
      filter.storeName = { $regex: search, $options: "i" };
    }

    const stores = await StoreModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await StoreModel.countDocuments(filter);

    res.status(200).json({
      stores,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not fetch stores", error: err.message });
  }
});

// GET /api/stores/:id — store detail (public)
router.get("/:id", async (req, res) => {
  try {
    const store = await StoreModel.findById(req.params.id).populate(
      "seller",
      "name email phone",
    );

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.status(200).json({ store });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not fetch store", error: err.message });
  }
});

// GET /api/stores/:id/products — store's product catalog (public)
router.get("/:id/products", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const products = await ProductModel.find({
      store: req.params.id,
      status: "active",
      isActive: true,
    })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await ProductModel.countDocuments({
      store: req.params.id,
      status: "active",
      isActive: true,
    });

    res.status(200).json({
      products,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not fetch products", error: err.message });
  }
});

// PATCH /api/stores/:id — [seller/owner] update own store
router.patch("/:id", verifyToken, verifyRole("seller"), async (req, res) => {
  try {
    const store = await StoreModel.findById(req.params.id);

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // ownership check — a seller can only edit their own store
    if (store.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You do not own this store" });
    }

    const allowedFields = [
      "storeName",
      "description",
      "logoUrl",
      "bannerUrl",
      "contactEmail",
      "contactPhone",
      "address",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        store[field] = req.body[field];
      }
    });

    await store.save();
    res.status(200).json({ message: "Store updated", store });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not update store", error: err.message });
  }
});

// PATCH /api/stores/:id/status — [admin] approve/reject/suspend
router.patch(
  "/:id/status",
  verifyToken,
  verifyRole("admin"),
  async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ["pending", "approved", "rejected", "suspended"];

      if (!validStatuses.includes(status)) {
        return res
          .status(400)
          .json({
            message: `status must be one of: ${validStatuses.join(", ")}`,
          });
      }

      const store = await StoreModel.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true },
      );

      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }

      // keep the seller's sellerProfile.approvalStatus in sync
      await UserModel.findByIdAndUpdate(store.seller, {
        "sellerProfile.approvalStatus": status,
      });

      res.status(200).json({ message: `Store status set to ${status}`, store });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Could not update store status", error: err.message });
    }
  },
);

export default router;
