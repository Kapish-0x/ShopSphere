import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./api/auth.js";
import userRoutes from "./api/users.js";
import storeRoutes from "./api/stores.js";
import categoryRoutes from "./api/categories.js";
import productRoutes from "./api/products.js";
import cartRoutes from "./api/cart.js";
import orderRoutes from "./api/orders.js";
import couponRoutes from "./api/coupons.js";
import reviewRoutes from "./api/reviews.js";
import returnRoutes from "./api/returns.js";
import aiRoutes from "./api/ai.js";
import wishlistRoutes from "./api/wishlist.js";
import supportRoutes from "./api/support.js";
import notificationRoutes from "./api/notifications.js";
import deliveryRoutes from "./api/delivery.js";
import dashboardRoutes from "./api/dashboard.js";
import auditLogRoutes from "./api/auditLogs.js";


dotenv.config();

const app = express();

app.use(express.json);
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit-logs", auditLogRoutes);

const PORT = process.env.PORT || 5000;

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected");

        app.listen(PORT, () => {
            console.log(`Server running on: ${PORT}`);
        });
    } catch (error) {
        console.error("DB connection failed: ", error);
    }
}

connectDB();


app.use((err, req, res, next) => {
  res.status(500).json({
    message: "Server error",
    error: err.message,
  });
});