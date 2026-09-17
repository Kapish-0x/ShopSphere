import { Router } from "express";
import { OrderModel } from "../models/OrderModel.js";
import { verifyToken, verifyRole } from "../middleware/verifyToken.js";

const router = Router();

// GET /api/delivery/my-deliveries — [delivery] all suborders assigned to this delivery partner
router.get("/my-deliveries", verifyToken, verifyRole("delivery"), async (req, res) => {
  try {
    const { status } = req.query;

    const orders = await OrderModel.find({
      "subOrders.deliveryPartner": req.user._id,
    })
      .populate("customer", "name phone")
      .sort({ createdAt: -1 });

    // flatten: pull out just the suborders assigned to this delivery partner,
    // attaching order-level context (orderNumber, shippingAddress, customer)
    let deliveries = orders.flatMap((order) =>
      order.subOrders
        .filter((so) => so.deliveryPartner?.toString() === req.user._id.toString())
        .map((so) => ({
          orderId: order._id,
          orderNumber: order.orderNumber,
          subOrderId: so._id,
          customer: order.customer,
          shippingAddress: order.shippingAddress,
          items: so.items,
          status: so.status,
          trackingId: so.trackingId,
          total: so.total,
        }))
    );

    if (status) {
      deliveries = deliveries.filter((d) => d.status === status);
    }

    res.status(200).json({ deliveries });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch deliveries", error: err.message });
  }
});

export default router;