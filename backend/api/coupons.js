import { Router } from "express";
import { CouponModel } from "../models/CouponModel.js";
import { verifyToken, verifyRole } from "../middleware/verifyToken.js";

const router = Router();

// POST /api/coupons — [admin] create
router.post("/", verifyToken, verifyRole("admin"), async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderValue,
      applicableStores,
      applicableCategories,
      usageLimit,
      usageLimitPerUser,
      validFrom,
      validUntil,
    } = req.body;

    if (!code || !discountType || discountValue === undefined || !validUntil) {
      return res.status(400).json({
        message: "code, discountType, discountValue, and validUntil are required",
      });
    }

    const existing = await CouponModel.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({ message: "A coupon with this code already exists" });
    }

    const coupon = await CouponModel.create({
      code,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderValue,
      applicableStores,
      applicableCategories,
      usageLimit,
      usageLimitPerUser,
      validFrom,
      validUntil,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Coupon created", coupon });
  } catch (err) {
    res.status(500).json({ message: "Could not create coupon", error: err.message });
  }
});

// GET /api/coupons — [admin] list all coupons
router.get("/", verifyToken, verifyRole("admin"), async (req, res) => {
  try {
    const coupons = await CouponModel.find().sort({ createdAt: -1 });
    res.status(200).json({ coupons });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch coupons", error: err.message });
  }
});

// POST /api/coupons/validate — any logged-in customer, checks if a code is usable on their cart
router.post("/validate", verifyToken, verifyRole("customer"), async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code || cartTotal === undefined) {
      return res.status(400).json({ message: "code and cartTotal are required" });
    }

    const coupon = await CouponModel.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "This coupon is no longer active" });
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return res.status(400).json({ message: "This coupon has expired or is not yet valid" });
    }

    if (cartTotal < coupon.minOrderValue) {
      return res.status(400).json({
        message: `Minimum order value for this coupon is ₹${coupon.minOrderValue}`,
      });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "This coupon has reached its usage limit" });
    }

    const timesUsedByUser = coupon.usedBy.filter(
      (id) => id.toString() === req.user._id.toString()
    ).length;
    if (timesUsedByUser >= coupon.usageLimitPerUser) {
      return res.status(400).json({ message: "You've already used this coupon" });
    }

    // calculate the discount
    let discount =
      coupon.discountType === "percentage"
        ? (cartTotal * coupon.discountValue) / 100
        : coupon.discountValue;

    if (coupon.discountType === "percentage" && coupon.maxDiscountAmount) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
    discount = Math.min(discount, cartTotal); // never discount more than the cart is worth

    res.status(200).json({
      message: "Coupon is valid",
      coupon: { id: coupon._id, code: coupon.code, discountType: coupon.discountType },
      discount,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not validate coupon", error: err.message });
  }
});

// PATCH /api/coupons/:id — [admin] update
router.patch("/:id", verifyToken, verifyRole("admin"), async (req, res) => {
  try {
    const allowedFields = [
      "description",
      "discountValue",
      "maxDiscountAmount",
      "minOrderValue",
      "usageLimit",
      "usageLimitPerUser",
      "validFrom",
      "validUntil",
      "isActive",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const coupon = await CouponModel.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json({ message: "Coupon updated", coupon });
  } catch (err) {
    res.status(500).json({ message: "Could not update coupon", error: err.message });
  }
});

// DELETE /api/coupons/:id — [admin] delete
router.delete("/:id", verifyToken, verifyRole("admin"), async (req, res) => {
  try {
    const coupon = await CouponModel.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.status(200).json({ message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete coupon", error: err.message });
  }
});

export default router;