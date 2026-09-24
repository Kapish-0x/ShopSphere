import { Router } from "express";
import { UserModel } from "../models/UserModel.js";
import { verifyToken, verifyRole } from "../middleware/VerifyToken.js";

const router = Router();

// GET /api/wishlist
router.get("/", verifyToken, verifyRole("customer"), async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id).populate(
      "wishlist",
      "title slug thumbnailUrl basePrice ratingAverage status"
    );
    res.status(200).json({ wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch wishlist", error: err.message });
  }
});

// POST /api/wishlist/:productId
router.post("/:productId", verifyToken, verifyRole("customer"), async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);

    const alreadyIn = user.wishlist.some((id) => id.toString() === req.params.productId);
    if (alreadyIn) {
      return res.status(409).json({ message: "Already in wishlist" });
    }

    user.wishlist.push(req.params.productId);
    await user.save();

    res.status(200).json({ message: "Added to wishlist", wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: "Could not add to wishlist", error: err.message });
  }
});

// DELETE /api/wishlist/:productId
router.delete("/:productId", verifyToken, verifyRole("customer"), async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);

    user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId);
    await user.save();

    res.status(200).json({ message: "Removed from wishlist", wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: "Could not remove from wishlist", error: err.message });
  }
});

export default router;