// import { Router } from "express";
// import { ReturnModel } from "../models/ReturnModel.js";
// import { OrderModel } from "../models/OrderModel.js";
// import { ProductModel } from "../models/ProductModel.js";
// import { StoreModel } from "../models/StoreModel.js";
// import { assertValidTransition } from "../models/orderStateMachine.js";
// import { verifyToken, verifyRole } from "../middleware/verifyToken.js";

// const router = Router();

// // POST /api/returns — [customer] request a return on a delivered suborder
// router.post("/", verifyToken, verifyRole("customer"), async (req, res) => {
//   try {
//     const { orderId, subOrderId, items, reason, description, imageUrls } = req.body;

//     if (!orderId || !subOrderId || !items?.length || !reason) {
//       return res.status(400).json({
//         message: "orderId, subOrderId, items, and reason are required",
//       });
//     }

//     const order = await OrderModel.findOne({ _id: orderId, customer: req.user._id });
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     const subOrder = order.subOrders.id(subOrderId);
//     if (!subOrder) {
//       return res.status(404).json({ message: "Suborder not found" });
//     }

//     if (subOrder.status !== "delivered") {
//       return res.status(400).json({ message: "Only delivered orders can be returned" });
//     }

//     // validate every requested item actually exists in this suborder with enough quantity
//     for (const reqItem of items) {
//       const originalItem = subOrder.items.find(
//         (i) => i.product.toString() === reqItem.product && i.variantId.toString() === reqItem.variantId
//       );
//       if (!originalItem || reqItem.quantity > originalItem.quantity) {
//         return res.status(400).json({ message: "Invalid item or quantity in return request" });
//       }
//     }

//     const returnRequest = await ReturnModel.create({
//       order: orderId,
//       subOrder: subOrderId,
//       customer: req.user._id,
//       store: subOrder.store,
//       items,
//       reason,
//       description,
//       imageUrls,
//       status: "requested",
//     });

//     res.status(201).json({ message: "Return requested", return: returnRequest });
//   } catch (err) {
//     res.status(500).json({ message: "Could not create return request", error: err.message });
//   }
// });

// // GET /api/returns — role-aware: customer sees own, seller sees their store's, admin/support see all
// router.get("/", verifyToken, async (req, res) => {
//   try {
//     let filter = {};

//     if (req.user.role === "customer") {
//       filter = { customer: req.user._id };
//     } else if (req.user.role === "seller") {
//       const store = await StoreModel.findOne({ seller: req.user._id });
//       if (!store) return res.status(200).json({ returns: [] });
//       filter = { store: store._id };
//     }
//     // admin/support see everything

//     const returns = await ReturnModel.find(filter)
//       .populate("customer", "name email")
//       .populate("store", "storeName")
//       .sort({ createdAt: -1 });

//     res.status(200).json({ returns });
//   } catch (err) {
//     res.status(500).json({ message: "Could not fetch returns", error: err.message });
//   }
// });

// // PATCH /api/returns/:id/status — [seller/support/admin] approve, reject, mark picked up, or refund
// router.patch("/:id/status", verifyToken, verifyRole("seller", "support", "admin"), async (req, res) => {
//   try {
//     const { status, resolutionNote, refundAmount } = req.body;

//     const validNext = {
//       requested: ["approved", "rejected"],
//       approved: ["picked_up"],
//       picked_up: ["refunded"],
//       rejected: [],
//       refunded: [],
//     };

//     const returnRequest = await ReturnModel.findById(req.params.id);
//     if (!returnRequest) {
//       return res.status(404).json({ message: "Return request not found" });
//     }

//     // sellers can only act on returns for their own store
//     if (req.user.role === "seller") {
//       const store = await StoreModel.findOne({ seller: req.user._id });
//       if (!store || returnRequest.store.toString() !== store._id.toString()) {
//         return res.status(403).json({ message: "This return is not for your store" });
//       }
//     }

//     if (!validNext[returnRequest.status]?.includes(status)) {
//       return res.status(400).json({
//         message: `Cannot move return from "${returnRequest.status}" to "${status}". Allowed: ${
//           validNext[returnRequest.status]?.join(", ") || "none"
//         }`,
//       });
//     }

//     // when marked refunded, restore stock for the returned items
//     if (status === "refunded") {
//       for (const item of returnRequest.items) {
//         const product = await ProductModel.findById(item.product);
//         const variant = product?.variants.id(item.variantId);
//         if (variant) {
//           variant.stock += item.quantity;
//           await product.save();
//         }
//       }

//       // also move the parent suborder into "returned" then this refund completes it —
//       // reuse the order state machine so both stay consistent
//       const order = await OrderModel.findById(returnRequest.order);
//       const subOrder = order.subOrders.id(returnRequest.subOrder);
//       if (subOrder && subOrder.status === "delivered") {
//         assertValidTransition(subOrder.status, "returned");
//         subOrder.status = "returned";
//         subOrder.statusHistory.push({ status: "returned", changedBy: req.user._id });
//         await order.save();
//       }

//       returnRequest.refundAmount = refundAmount;
//     }

//     returnRequest.status = status;
//     returnRequest.resolutionNote = resolutionNote;
//     returnRequest.handledBy = req.user._id;
//     await returnRequest.save();

//     res.status(200).json({ message: `Return status updated to ${status}`, return: returnRequest });
//   } catch (err) {
//     res.status(500).json({ message: "Could not update return status", error: err.message });
//   }
// });

// export default router;


import { Router } from "express";
import { ReturnModel } from "../models/ReturnModel.js";
import { OrderModel } from "../models/OrderModel.js";
import { ProductModel } from "../models/ProductModel.js";
import { StoreModel } from "../models/StoreModel.js";
import { assertValidTransition } from "../models/orderStateMachine.js";
import { verifyToken, verifyRole } from "../middleware/verifyToken.js";

const router = Router();

// POST /api/returns — [customer/user] request a return on a delivered suborder
router.post("/", verifyToken, verifyRole("customer", "user"), async (req, res) => {
  try {
    const { orderId, subOrderId, items, reason, description, imageUrls } = req.body;

    if (!orderId || !subOrderId || !items?.length || !reason) {
      return res.status(400).json({
        message: "orderId, subOrderId, items, and reason are required",
      });
    }

    const order = await OrderModel.findOne({ _id: orderId, customer: req.user._id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const subOrder = order.subOrders.id(subOrderId);
    if (!subOrder) {
      return res.status(404).json({ message: "Suborder not found" });
    }

    if (subOrder.status !== "delivered") {
      return res.status(400).json({ message: "Only delivered orders can be returned" });
    }

    // validate every requested item actually exists in this suborder with enough quantity
    for (const reqItem of items) {
      const originalItem = subOrder.items.find((i) => {
        const productMatches = i.product.toString() === reqItem.product;
        const variantMatches = !i.variantId || !reqItem.variantId 
          ? true 
          : i.variantId.toString() === reqItem.variantId.toString();
        return productMatches && variantMatches;
      });

      if (!originalItem || reqItem.quantity > originalItem.quantity) {
        return res.status(400).json({ message: "Invalid item or quantity in return request" });
      }
    }

    const returnRequest = await ReturnModel.create({
      order: orderId,
      subOrder: subOrderId,
      customer: req.user._id,
      store: subOrder.store,
      items,
      reason,
      description,
      imageUrls,
      status: "requested",
    });

    res.status(201).json({ message: "Return requested", return: returnRequest });
  } catch (err) {
    res.status(500).json({ message: "Could not create return request", error: err.message });
  }
});

// GET /api/returns — role-aware: customer sees own, seller sees their store's, admin/support see all
router.get("/", verifyToken, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "customer" || req.user.role === "user") {
      filter = { customer: req.user._id };
    } else if (req.user.role === "seller") {
      const store = await StoreModel.findOne({ seller: req.user._id });
      if (!store) return res.status(200).json({ returns: [] });
      filter = { store: store._id };
    }
    // admin/support see everything

    const returns = await ReturnModel.find(filter)
      .populate("customer", "name email")
      .populate("store", "storeName")
      .sort({ createdAt: -1 });

    res.status(200).json({ returns });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch returns", error: err.message });
  }
});

// PATCH /api/returns/:id/status — [seller/support/admin] approve, reject, mark picked up, or refund
router.patch("/:id/status", verifyToken, verifyRole("seller", "support", "admin"), async (req, res) => {
  try {
    const { status, resolutionNote, refundAmount } = req.body;

    const validNext = {
      requested: ["approved", "rejected"],
      approved: ["picked_up"],
      picked_up: ["refunded"],
      rejected: [],
      refunded: [],
    };

    const returnRequest = await ReturnModel.findById(req.params.id);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }

    // sellers can only act on returns for their own store
    if (req.user.role === "seller") {
      const store = await StoreModel.findOne({ seller: req.user._id });
      if (!store || returnRequest.store.toString() !== store._id.toString()) {
        return res.status(403).json({ message: "This return is not for your store" });
      }
    }

    if (!validNext[returnRequest.status]?.includes(status)) {
      return res.status(400).json({
        message: `Cannot move return from "${returnRequest.status}" to "${status}". Allowed: ${
          validNext[returnRequest.status]?.join(", ") || "none"
        }`,
      });
    }

    // when marked refunded, restore stock for the returned items
    if (status === "refunded") {
      for (const item of returnRequest.items) {
        const product = await ProductModel.findById(item.product);
        const variant = item.variantId ? product?.variants?.id(item.variantId) : null;
        if (variant) {
          variant.stock += item.quantity;
          await product.save();
        }
      }

      // also move the parent suborder into "returned" then this refund completes it —
      // reuse the order state machine so both stay consistent
      const order = await OrderModel.findById(returnRequest.order);
      const subOrder = order.subOrders.id(returnRequest.subOrder);
      if (subOrder && subOrder.status === "delivered") {
        assertValidTransition(subOrder.status, "returned");
        subOrder.status = "returned";
        subOrder.statusHistory.push({ status: "returned", changedBy: req.user._id });
        await order.save();
      }

      returnRequest.refundAmount = refundAmount;
    }

    returnRequest.status = status;
    returnRequest.resolutionNote = resolutionNote;
    returnRequest.handledBy = req.user._id;
    await returnRequest.save();

    res.status(200).json({ message: `Return status updated to ${status}`, return: returnRequest });
  } catch (err) {
    res.status(500).json({ message: "Could not update return status", error: err.message });
  }
});

export default router;