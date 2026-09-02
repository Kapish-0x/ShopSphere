import { Router } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

// helper functions to make tokens — kept right here, no separate file needed
const makeAccessToken = (user) =>
  jwt.sign(
    { userId: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    },
  );

const makeRefreshToken = (user) =>
  jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // block people from self-registering as admin
    const allowedRoles = ["customer", "seller", "delivery", "support"];
    const finalRole = allowedRoles.includes(role) ? role : "customer";

    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const user = await UserModel.create({
      name,
      email,
      password,
      phone,
      role: finalRole,
    });

    const accessToken = makeAccessToken(user);
    const refreshToken = makeRefreshToken(user);

    user.refreshTokens.push(refreshToken);
    await user.save();

    res
      .status(201)
      .json({
        message: "Registered successfully",
        user,
        accessToken,
        refreshToken,
      });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "This account has been deactivated" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = makeAccessToken(user);
    const refreshToken = makeRefreshToken(user);

    user.refreshTokens.push(refreshToken);
    user.lastLoginAt = new Date();
    await user.save();

    res
      .status(200)
      .json({ message: "Login successful", user, accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// POST /api/auth/refresh-token
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken: incomingToken } = req.body;
    if (!incomingToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    const user = await UserModel.findById(decoded.userId).select(
      "+refreshTokens",
    );
    if (!user || !user.refreshTokens.includes(incomingToken)) {
      return res.status(401).json({ message: "Refresh token not recognized" });
    }

    const newAccessToken = makeAccessToken(user);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not refresh token", error: err.message });
  }
});

// POST /api/auth/logout
router.post("/logout", verifyToken, async (req, res) => {
  try {
    const { refreshToken: incomingToken } = req.body;
    const user = req.user;

    if (incomingToken) {
      user.refreshTokens = user.refreshTokens.filter(
        (t) => t !== incomingToken,
      );
      await user.save();
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed", error: err.message });
  }
});

// GET /api/auth/me — quick example of a protected route using verifyToken
router.get("/me", verifyToken, async (req, res) => {
  res.status(200).json({ user: req.user });
});

// PATCH /api/auth/change-password
router.patch("/change-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old and new password are required" });
    }

    const user = await UserModel.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    user.password = newPassword; // pre-save hook re-hashes automatically
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not change password", error: err.message });
  }
});

export default router;
