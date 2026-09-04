import { Router } from "express";
import { UserModel } from "../models/UserModel.js";
import { verifyToken, verifyRole } from "../middleware/verifyToken.js";

const router = Router();

// GET /api/users/me
router.get("/me", verifyToken, async (req, res) => {
  res.status(200).json({ user: req.user });
});

// PATCH /api/users/me — update own profile (name, phone only — not email/role/password here)
router.patch("/me", verifyToken, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;

    const user = await UserModel.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ message: "Profile updated", user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not update profile", error: err.message });
  }
});

// GET /api/users/me/addresses
router.get("/me/addresses", verifyToken, async (req, res) => {
  res.status(200).json({ addresses: req.user.addresses });
});

// POST /api/users/me/addresses
router.post("/me/addresses", verifyToken, async (req, res) => {
  try {
    const { label, line1, line2, city, state, pincode, country, isDefault } =
      req.body;

    if (!line1 || !city || !state || !pincode) {
      return res
        .status(400)
        .json({ message: "line1, city, state, and pincode are required" });
    }

    const user = await UserModel.findById(req.user._id);

    // if this new address is set as default, unset default on all others
    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push({
      label,
      line1,
      line2,
      city,
      state,
      pincode,
      country,
      isDefault,
    });
    await user.save();

    res
      .status(201)
      .json({ message: "Address added", addresses: user.addresses });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not add address", error: err.message });
  }
});

// PATCH /api/users/me/addresses/:id
router.patch("/me/addresses/:id", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const { label, line1, line2, city, state, pincode, country, isDefault } =
      req.body;

    if (label !== undefined) address.label = label;
    if (line1 !== undefined) address.line1 = line1;
    if (line2 !== undefined) address.line2 = line2;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (pincode !== undefined) address.pincode = pincode;
    if (country !== undefined) address.country = country;

    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
      address.isDefault = true;
    }

    await user.save();
    res
      .status(200)
      .json({ message: "Address updated", addresses: user.addresses });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not update address", error: err.message });
  }
});

// DELETE /api/users/me/addresses/:id
router.delete("/me/addresses/:id", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    address.deleteOne();
    await user.save();

    res
      .status(200)
      .json({ message: "Address deleted", addresses: user.addresses });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not delete address", error: err.message });
  }
});

// GET /api/users — [admin] list all users, with optional ?role= filter and pagination
router.get("/", verifyToken, verifyRole("admin"), async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role) filter.role = role;

    const users = await UserModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await UserModel.countDocuments(filter);

    res.status(200).json({
      users,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not fetch users", error: err.message });
  }
});

// PATCH /api/users/:id/status — [admin] activate/deactivate/suspend
router.patch(
  "/:id/status",
  verifyToken,
  verifyRole("admin"),
  async (req, res) => {
    try {
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res
          .status(400)
          .json({ message: "isActive must be true or false" });
      }

      const user = await UserModel.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true },
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res
        .status(200)
        .json({
          message: `User ${isActive ? "activated" : "deactivated"}`,
          user,
        });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Could not update user status", error: err.message });
    }
  },
);

export default router;
