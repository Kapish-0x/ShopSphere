import { Schema, model } from "mongoose";

const auditLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true }, // who did it
    action: { type: String, required: true }, // e.g. "STORE_APPROVED", "PRODUCT_REJECTED", "USER_SUSPENDED"

    targetType: { type: String, required: true }, // e.g. "Store", "Product", "User"
    targetId: { type: Schema.Types.ObjectId, required: true },

    details: { type: Schema.Types.Mixed }, // any extra context, e.g. { oldStatus, newStatus }
  },
  { timestamps: true }
);

auditLogSchema.index({ actor: 1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLogModel = model("AuditLog", auditLogSchema);