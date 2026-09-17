import { Router } from "express";
import { OrderModel } from "../models/OrderModel.js";
import { StoreModel } from "../models/StoreModel.js";
import { ProductModel } from "../models/ProductModel.js";
import { UserModel } from "../models/UserModel.js";
import { ReturnModel } from "../models/ReturnModel.js";
import { ReviewModel } from "../models/ReviewModel.js";
import { SupportTicketModel } from "../models/SupportTicketModel.js";
import { verifyToken, verifyRole } from "../middleware/verifyToken.js";

const router = Router();

// GET /api/dashboard/seller — [seller] revenue, orders, inventory, product performance
router.get("/seller", verifyToken, verifyRole("seller"), async (req, res) => {
  try {
    const store = await StoreModel.findOne({ seller: req.user._id });
    if (!store) {
      return res.status(400).json({ message: "You don't have a store yet" });
    }

    const orders = await OrderModel.find({ "subOrders.store": store._id });

    // pull out just this store's suborders across all orders
    const mySubOrders = orders.flatMap((order) =>
      order.subOrders.filter((so) => so.store.toString() === store._id.toString())
    );

    const totalOrders = mySubOrders.length;
    const totalRevenue = mySubOrders
      .filter((so) => ["delivered", "confirmed", "packed", "shipped"].includes(so.status))
      .reduce((sum, so) => sum + so.total, 0);

    const ordersByStatus = mySubOrders.reduce((acc, so) => {
      acc[so.status] = (acc[so.status] || 0) + 1;
      return acc;
    }, {});

    // top products by units sold
    const productSales = {};
    mySubOrders.forEach((so) => {
      so.items.forEach((item) => {
        const key = item.product.toString();
        if (!productSales[key]) {
          productSales[key] = { title: item.title, unitsSold: 0, revenue: 0 };
        }
        productSales[key].unitsSold += item.quantity;
        productSales[key].revenue += item.price * item.quantity;
      });
    });
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    // low stock alert — variants with less than 10 available units
    const products = await ProductModel.find({ store: store._id, isActive: true });
    const lowStockVariants = [];
    products.forEach((product) => {
      product.variants.forEach((variant) => {
        const available = variant.stock - variant.reservedStock;
        if (available < 10) {
          lowStockVariants.push({
            productTitle: product.title,
            sku: variant.sku,
            available,
          });
        }
      });
    });

    res.status(200).json({
      store: { name: store.storeName, status: store.status },
      totalOrders,
      totalRevenue,
      ordersByStatus,
      totalProducts: products.length,
      topProducts,
      lowStockVariants,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not load dashboard", error: err.message });
  }
});

// GET /api/dashboard/admin — [admin] platform-wide reports
router.get("/admin", verifyToken, verifyRole("admin"), async (req, res) => {
  try {
    const [
      totalUsers,
      usersByRole,
      totalStores,
      pendingStores,
      totalProducts,
      pendingProducts,
      totalOrders,
      pendingReturns,
      pendingReviews,
      pendingTickets,
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      StoreModel.countDocuments(),
      StoreModel.countDocuments({ status: "pending" }),
      ProductModel.countDocuments(),
      ProductModel.countDocuments({ status: "pending_review" }),
      OrderModel.countDocuments(),
      ReturnModel.countDocuments({ status: "requested" }),
      ReviewModel.countDocuments({ status: "pending" }),
      SupportTicketModel.countDocuments({ status: "open" }),
    ]);

    const allOrders = await OrderModel.find().select("grandTotal");
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.grandTotal, 0);

    res.status(200).json({
      users: {
        total: totalUsers,
        byRole: usersByRole.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
      },
      stores: { total: totalStores, pendingApproval: pendingStores },
      products: { total: totalProducts, pendingApproval: pendingProducts },
      orders: { total: totalOrders, totalRevenue },
      pendingActions: {
        returns: pendingReturns,
        reviews: pendingReviews,
        supportTickets: pendingTickets,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Could not load dashboard", error: err.message });
  }
});

export default router;