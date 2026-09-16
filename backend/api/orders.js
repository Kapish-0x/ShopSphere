import { Router } from "express";
import { CartModel } from "../models/CartModel.js";
import { OrderModel } from "../models/OrderModel.js";
import { ProductModel } from "../models/ProductModel.js";
import { StoreModel } from "../models/StoreModel.js";
import { canTransition, assertValidTransition } from "../models/orderStateMachine.js";
import { verifyToken, verifyRole } from "../middleware/verifyToken.js";

const router = Router();

const generateOrderNumber = () => {
  // e.g. SS-1725870512345-472  — timestamp + random 3 digits, unique enough for this scale
  const rand = Math.floor(100 + Math.random() * 900);
  return `SS-${Date.now()}-${rand}`;
};

// POST /api/orders/checkout
// Converts the customer's cart into an Order, split into one subOrder per store,
// and reserves stock for every item so it can't be sold twice.
router.post("/checkout", verifyToken, verifyRole("customer"), async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = "cod" } = req.body;

    if (!shippingAddress || !shippingAddress.line1 || !shippingAddress.city) {
      return res.status(400).json({ message: "A valid shippingAddress is required" });
    }

    const cart = await CartModel.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Step 1: validate stock and lock in real current prices for every item.
    // We re-fetch from Product rather than trusting cart.priceAtAdd, since
    // prices/stock may have changed since the item was added.
    const validatedItems = [];

    for (const cartItem of cart.items) {
      const product = await ProductModel.findById(cartItem.product);
      if (!product || product.status !== "active" || !product.isActive) {
        return res.status(400).json({ message: `A product in your cart is no longer available` });
      }

      const variant = product.variants.id(cartItem.variantId);
      if (!variant || !variant.isActive) {
        return res.status(400).json({ message: `A product variant in your cart is no longer available` });
      }

      const availableStock = variant.stock - variant.reservedStock;
      if (availableStock < cartItem.quantity) {
        return res.status(400).json({
          message: `Not enough stock for "${product.title}". Only ${availableStock} left.`,
        });
      }

      validatedItems.push({
        product,
        variant,
        store: cartItem.store,
        quantity: cartItem.quantity,
      });
    }

    // Step 2: reserve stock for every item now, before creating the order,
    // so two customers can't both check out the last unit at the same time.
    for (const { product, variant, quantity } of validatedItems) {
      variant.reservedStock += quantity;
      await product.save();
    }

    // Step 3: group validated items by store into subOrders
    const subOrderMap = new Map(); // storeId -> items[]

    for (const { product, variant, store, quantity } of validatedItems) {
      const storeId = store.toString();
      if (!subOrderMap.has(storeId)) {
        subOrderMap.set(storeId, []);
      }
      subOrderMap.get(storeId).push({
        product: product._id,
        variantId: variant._id,
        title: product.title,
        sku: variant.sku,
        variantAttributes: variant.attributes,
        imageUrl: variant.imageUrls?.[0],
        price: variant.price,
        quantity,
      });
    }

    const subOrders = [];
    let grandTotal = 0;

    for (const [storeId, items] of subOrderMap.entries()) {
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shippingFee = 0; // flat/free for this project's scope — extend later if needed
      const total = subtotal + shippingFee;

      subOrders.push({
        store: storeId,
        items,
        subtotal,
        shippingFee,
        total,
        status: "placed",
        statusHistory: [{ status: "placed", changedBy: req.user._id }],
      });

      grandTotal += total;
    }

    const order = await OrderModel.create({
      orderNumber: generateOrderNumber(),
      customer: req.user._id,
      shippingAddress,
      subOrders,
      grandTotal,
      payment: { method: paymentMethod, status: paymentMethod === "cod" ? "pending" : "pending" },
    });

    // Step 4: clear the cart now that it's been converted into an order
    cart.items = [];
    cart.appliedCoupon = null;
    await cart.save();

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Checkout failed", error: err.message });
  }
});

// GET /api/orders — role-aware: customer sees own orders, seller sees suborders for their store
router.get("/", verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    let filter = {};

    if (req.user.role === "customer") {
      filter = { customer: req.user._id };
    } else if (req.user.role === "seller") {
      const store = await StoreModel.findOne({ seller: req.user._id });
      if (!store) {
        return res.status(200).json({ orders: [], pagination: { total: 0 } });
      }
      filter = { "subOrders.store": store._id };
    }
    // admin and support see everything — filter stays {}

    const orders = await OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await OrderModel.countDocuments(filter);

    res.status(200).json({
      orders,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch orders", error: err.message });
  }
});

// GET /api/orders/:id — order detail
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.id).populate(
      "customer",
      "name email phone"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ownership check for customers; sellers/admin/support/delivery can view (kept simple for this project)
    if (req.user.role === "customer" && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This is not your order" });
    }

    res.status(200).json({ order });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch order", error: err.message });
  }
});

// PATCH /api/orders/:id/suborders/:subOrderId/status
// Moves one seller's portion of the order to the next valid status.
// Handles the inventory side-effects for each transition.
router.patch("/:id/suborders/:subOrderId/status", verifyToken, async (req, res) => {
  try {
    const { status: nextStatus, note } = req.body;

    const order = await OrderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const subOrder = order.subOrders.id(req.params.subOrderId);
    if (!subOrder) {
      return res.status(404).json({ message: "Suborder not found" });
    }

    // permission check based on role
    if (req.user.role === "seller") {
      const store = await StoreModel.findOne({ seller: req.user._id });
      if (!store || subOrder.store.toString() !== store._id.toString()) {
        return res.status(403).json({ message: "This suborder does not belong to your store" });
      }
    } else if (req.user.role === "delivery") {
      if (!subOrder.deliveryPartner || subOrder.deliveryPartner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You are not assigned to this delivery" });
      }
    } else if (!["admin", "support"].includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to update this order" });
    }

    const currentStatus = subOrder.status;

    try {
      assertValidTransition(currentStatus, nextStatus);
    } catch (transitionErr) {
      return res.status(400).json({ message: transitionErr.message });
    }

    // Handle inventory side-effects per transition
    for (const item of subOrder.items) {
      const product = await ProductModel.findById(item.product);
      const variant = product?.variants.id(item.variantId);
      if (!variant) continue;

      if (nextStatus === "confirmed") {
        // commit the reservation: actually deduct stock now
        variant.stock -= item.quantity;
        variant.reservedStock -= item.quantity;
        await product.save();
      } else if (nextStatus === "cancelled") {
        if (currentStatus === "placed") {
          // never committed — just release the hold
          variant.reservedStock -= item.quantity;
        } else {
          // already committed (confirmed/packed) — restore actual stock
          variant.stock += item.quantity;
        }
        await product.save();
      } else if (nextStatus === "returned") {
        // stock comes back after a delivered item is returned
        variant.stock += item.quantity;
        await product.save();
      }
    }

    subOrder.status = nextStatus;
    subOrder.statusHistory.push({ status: nextStatus, changedBy: req.user._id, note });

    if (nextStatus === "cancelled") subOrder.cancelReason = note;
    if (nextStatus === "returned") subOrder.returnReason = note;

    await order.save();

    res.status(200).json({ message: `Suborder status updated to ${nextStatus}`, order });
  } catch (err) {
    res.status(500).json({ message: "Could not update suborder status", error: err.message });
  }
});

// PATCH /api/orders/:id/suborders/:subOrderId/assign-delivery — [admin/seller] assign a delivery partner
router.patch(
  "/:id/suborders/:subOrderId/assign-delivery",
  verifyToken,
  verifyRole("admin", "seller"),
  async (req, res) => {
    try {
      const { deliveryPartnerId } = req.body;

      const order = await OrderModel.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const subOrder = order.subOrders.id(req.params.subOrderId);
      if (!subOrder) {
        return res.status(404).json({ message: "Suborder not found" });
      }

      subOrder.deliveryPartner = deliveryPartnerId;
      await order.save();

      res.status(200).json({ message: "Delivery partner assigned", order });
    } catch (err) {
      res.status(500).json({ message: "Could not assign delivery partner", error: err.message });
    }
  }
);

export default router;