import { Router } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserModel } from "../models/UserModel.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

// helper functions to make tokens — kept right here, no separate file needed
const makeAccessToken = (user) =>
  jwt.sign({ userId: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

const makeRefreshToken = (user) =>
  jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const allowedRoles = ["customer", "seller", "delivery", "support"];
    const finalRole = allowedRoles.includes(role) ? role : "customer";

    // 1. Check existing user
    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // 2. Generate token beforehand
    const rawEmailVerifyToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationToken = crypto.createHash("sha256").update(rawEmailVerifyToken).digest("hex");

    // 3. Instantiate model once
    const user = new UserModel({
      name,
      email,
      password,
      phone,
      role: finalRole,
      emailVerificationToken,
    });

    // 4. Generate JWT Tokens
    const accessToken = makeAccessToken(user);
    const refreshToken = makeRefreshToken(user);

    user.refreshTokens = [refreshToken];

    // 5. Save ONCE to Database
    await user.save();

    console.log(`Registered user successfully: ${email}`);

    // Return response immediately
    return res.status(201).json({
      message: "Registered successfully",
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("REGISTER API CRASH:", err);
    // Explicitly send response back so frontend doesn't hang!
    return res.status(500).json({ 
      message: "Registration failed", 
      error: err.message || "Internal server error" 
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await UserModel.findOne({ email }).select("+password +refreshTokens");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been deactivated" });
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

    res.status(200).json({ message: "Login successful", user, accessToken, refreshToken });
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
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const user = await UserModel.findById(decoded.userId).select("+refreshTokens");
    if (!user || !user.refreshTokens.includes(incomingToken)) {
      return res.status(401).json({ message: "Refresh token not recognized" });
    }

    const newAccessToken = makeAccessToken(user);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(500).json({ message: "Could not refresh token", error: err.message });
  }
});

// POST /api/auth/logout
router.post("/logout", verifyToken, async (req, res) => {
  try {
    const { refreshToken: incomingToken } = req.body;
    const user = req.user;

    if (incomingToken) {
      user.refreshTokens = user.refreshTokens.filter((t) => t !== incomingToken);
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
      return res.status(400).json({ message: "Old and new password are required" });
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
    res.status(500).json({ message: "Could not change password", error: err.message });
  }
});

// POST /api/auth/forgot-password
// Generates a reset token. No email service is wired up yet, so for now the
// token is returned in the response + logged to console so you can test the flow.
// Swap this out for actually sending an email via nodemailer once you set up SMTP.
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const user = await UserModel.findOne({ email });
    // always respond the same way whether or not the email exists —
    // this stops people from using this endpoint to check which emails are registered
    if (!user) {
      return res.status(200).json({
        message: "If this email is registered, a reset link has been sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // TODO: replace this console.log with an actual email send once SMTP is configured
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.status(200).json({
      message: "If this email is registered, a reset link has been sent",
      devResetToken: resetToken, // remove this field once real email sending is wired up
    });
  } catch (err) {
    res.status(500).json({ message: "Could not process request", error: err.message });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "token and newPassword are required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({ message: "Reset token is invalid or has expired" });
    }

    user.password = newPassword; // pre-save hook re-hashes
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // log out of all sessions after a password reset, for safety
    await user.save();

    res.status(200).json({ message: "Password reset successful, please log in again" });
  } catch (err) {
    res.status(500).json({ message: "Could not reset password", error: err.message });
  }
});

// GET /api/auth/verify-email/:token
router.get("/verify-email/:token", async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await UserModel.findOne({
      emailVerificationToken: hashedToken,
    }).select("+emailVerificationToken");

    if (!user) {
      return res.status(400).json({ message: "Verification link is invalid or already used" });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Could not verify email", error: err.message });
  }
});

export default router;