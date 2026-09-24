import { Router } from "express";
import { ReviewModel } from "../models/ReviewModel.js";
import { ProductModel } from "../models/ProductModel.js";
import { OrderModel } from "../models/OrderModel.js";
import { StoreModel } from "../models/StoreModel.js";
import { verifyToken, verifyRole } from "../middleware/VerifyToken.js";

const router = Router();

// helper: recalculates a product's ratingAverage/ratingCount from its approved reviews
const recalculateProductRating = async (productId) => {
  const reviews = await ReviewModel.find({ product: productId, status: "approved" });
  const ratingCount = reviews.length;
  const ratingAverage = ratingCount
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount
    : 0;

  await ProductModel.findByIdAndUpdate(productId, {
    ratingAverage: Math.round(ratingAverage * 10) / 10, // one decimal place
    ratingCount,
  });
};

// GET /api/reviews/product/:productId — public, only approved reviews
router.get("/product/:productId", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await ReviewModel.find({
      product: req.params.productId,
      status: "approved",
    })
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await ReviewModel.countDocuments({
      product: req.params.productId,
      status: "approved",
    });

    res.status(200).json({ reviews, pagination: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch reviews", error: err.message });
  }
});

// POST /api/reviews — [customer] create, requires a verified purchase
router.post("/", verifyToken, verifyRole("customer"), async (req, res) => {
  try {
    const { productId, orderId, rating, title, comment, imageUrls } = req.body;

    if (!productId || !orderId || !rating) {
      return res.status(400).json({ message: "productId, orderId, and rating are required" });
    }

    // verify this order belongs to the customer and actually contains this product,
    // and that the relevant suborder has been delivered
    const order = await OrderModel.findOne({ _id: orderId, customer: req.user._id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const purchasedItem = order.subOrders
      .filter((so) => so.status === "delivered")
      .flatMap((so) => so.items)
      .find((item) => item.product.toString() === productId);

    if (!purchasedItem) {
      return res
        .status(403)
        .json({ message: "You can only review products from delivered orders" });
    }

    const review = await ReviewModel.create({
      product: productId,
      customer: req.user._id,
      order: orderId,
      rating,
      title,
      comment,
      imageUrls,
      status: "pending", // goes to moderation queue
    });

    res.status(201).json({ message: "Review submitted, pending moderation", review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "You've already reviewed this product for this order" });
    }
    res.status(500).json({ message: "Could not submit review", error: err.message });
  }
});

// PATCH /api/reviews/:id/reply — [seller] reply to a review on their product
router.patch("/:id/reply", verifyToken, verifyRole("seller"), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Reply text is required" });
    }

    const review = await ReviewModel.findById(req.params.id).populate("product");
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const store = await StoreModel.findById(review.product.store);
    if (store.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This review is not on your product" });
    }

    review.sellerReply = { text, repliedAt: new Date() };
    await review.save();

    res.status(200).json({ message: "Reply added", review });
  } catch (err) {
    res.status(500).json({ message: "Could not add reply", error: err.message });
  }
});

// GET /api/reviews/pending — [admin] moderation queue
router.get("/pending", verifyToken, verifyRole("admin"), async (req, res) => {
  try {
    const reviews = await ReviewModel.find({ status: "pending" })
      .populate("product", "title")
      .populate("customer", "name")
      .sort({ createdAt: 1 });

    res.status(200).json({ reviews });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch pending reviews", error: err.message });
  }
});

// PATCH /api/reviews/:id/moderate — [admin] approve/reject
router.patch("/:id/moderate", verifyToken, verifyRole("admin"), async (req, res) => {
  try {
    const { status, moderationNote } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "status must be 'approved' or 'rejected'" });
    }

    const review = await ReviewModel.findByIdAndUpdate(
      req.params.id,
      { status, moderationNote },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // update the product's aggregate rating whenever a review's status changes
    await recalculateProductRating(review.product);

    res.status(200).json({ message: `Review ${status}`, review });
  } catch (err) {
    res.status(500).json({ message: "Could not moderate review", error: err.message });
  }
});

export default router;