import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await UserModel.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    req.user = user; // available in every protected route from here on
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

// usage: verifyRole("admin", "seller") OR verifyRole(["admin", "seller"])
export const verifyRole = (...roles) => {
  return (req, res, next) => {
    // Flatten roles array in case an array was passed as a single argument
    const allowedRoles = roles.flat();

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      console.log(`[403 PERMISSION DENIED] User Role: "${req.user?.role}" | Allowed Roles:`, allowedRoles);
      return res.status(403).json({ message: "You don't have permission for this" });
    }
    next();
  };
};