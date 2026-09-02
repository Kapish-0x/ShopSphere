import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const addressSchema = new Schema(
  {
    label: { type: String, default: "Home" },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const sellerProfileSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store" },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    gstNumber: { type: String },
    payoutDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
    },
  },
  { _id: false }
);

const deliveryProfileSchema = new Schema(
  {
    vehicleType: { type: String, enum: ["bike", "van", "truck"] },
    vehicleNumber: { type: String },
    serviceArea: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    currentAssignedOrders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true },

    role: {
      type: String,
      enum: ["admin", "seller", "customer", "support", "delivery"],
      required: true,
      default: "customer",
    },

    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    addresses: [addressSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],

    // Only populated based on role
    sellerProfile: sellerProfileSchema,
    deliveryProfile: deliveryProfileSchema,

    refreshTokens: [{ type: String, select: false }],
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    emailVerificationToken: { type: String, select: false },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Hide sensitive fields when converting to JSON
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.refreshTokens;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.emailVerificationToken;
    return ret;
  },
});

userSchema.index({ role: 1 });

export const UserModel = model("User", userSchema);