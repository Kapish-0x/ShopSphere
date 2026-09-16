import { Router } from "express";
import { CartModel } from "../models/CartModel.js";
import { ProductModel } from "../models/ProductModel.js";
import { verifyToken, verifyRole } from "../middleware/verifyToken.js";

const router = Router();

// GET /api/cart — get current user's cart, populated with live product info
router.get("/", verifyToken, verifyRole("customer"), async (req, res) => {
  try {
    let cart = await CartModel.findOne({ user: req.user._id }).populate(
      "items.product",
      "title thumbnailUrl slug status isActive"
    );

    if (!cart) {
      cart = await CartModel.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({ cart });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch cart", error: err.message });
  }
});

// POST /api/cart/items — add an item (or increase quantity if it already exists)
router.post("/items", verifyToken, verifyRole("customer"), async (req, res) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;

    if (!productId || !variantId) {
      return res.status(400).json({ message: "productId and variantId are required" });
    }
    if (quantity < 1) {
      return res.status(400).json({ message: "quantity must be at least 1" });
    }

    const product = await ProductModel.findById(productId);
    if (!product || product.status !== "active" || !product.isActive) {
      return res.status(404).json({ message: "Product not available" });
    }

    const variant = product.variants.id(variantId);
    if (!variant || !variant.isActive) {
      return res.status(404).json({ message: "Variant not available" });
    }

    const availableStock = variant.stock - variant.reservedStock;
    if (availableStock < quantity) {
      return res.status(400).json({ message: `Only ${availableStock} in stock` });
    }

    let cart = await CartModel.findOne({ user: req.user._id });
    if (!cart) {
      cart = await CartModel.create({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId && item.variantId.toString() === variantId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.priceAtAdd = variant.price; // refresh snapshot to current price
    } else {
      cart.items.push({
        product: productId,
        variantId,
        store: product.store,
        quantity,
        priceAtAdd: variant.price,
      });
    }

    await cart.save();
    res.status(200).json({ message: "Item added to cart", cart });
  } catch (err) {
    res.status(500).json({ message: "Could not add item to cart", error: err.message });
  }
});

// PATCH /api/cart/items/:itemId — update quantity of a cart item
router.patch("/items/:itemId", verifyToken, verifyRole("customer"), async (req, res) => {
  try {
    const { quantity } = req.body;

    if (typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({ message: "quantity must be at least 1" });
    }

    const cart = await CartModel.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // re-check live stock before allowing the increase
    const product = await ProductModel.findById(item.product);
    const variant = product?.variants.id(item.variantId);
    const availableStock = variant ? variant.stock - variant.reservedStock : 0;

    if (availableStock < quantity) {
      return res.status(400).json({ message: `Only ${availableStock} in stock` });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({ message: "Cart item updated", cart });
  } catch (err) {
    res.status(500).json({ message: "Could not update cart item", error: err.message });
  }
});

// DELETE /api/cart/items/:itemId — remove a single item
router.delete("/items/:itemId", verifyToken, verifyRole("customer"), async (req, res) => {
  try {
    const cart = await CartModel.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    item.deleteOne();
    await cart.save();

    res.status(200).json({ message: "Item removed", cart });
  } catch (err) {
    res.status(500).json({ message: "Could not remove item", error: err.message });
  }
});

// DELETE /api/cart — clear the entire cart
router.delete("/", verifyToken, verifyRole("customer"), async (req, res) => {
  try {
    const cart = await CartModel.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.appliedCoupon = null;
    await cart.save();

    res.status(200).json({ message: "Cart cleared", cart });
  } catch (err) {
    res.status(500).json({ message: "Could not clear cart", error: err.message });
  }
});

export default router;