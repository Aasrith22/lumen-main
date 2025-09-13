import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // User profiles with role-based access
  userProfiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("user")),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user_id", ["userId"]),

  // Subscription plans
  plans: defineTable({
    name: v.string(),
    description: v.string(),
    productType: v.union(v.literal("Fibernet"), v.literal("Broadband Copper")),
    price: v.number(),
    dataQuota: v.number(), // in GB
    features: v.array(v.string()),
    isActive: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_product_type", ["productType"])
    .index("by_active", ["isActive"]),

  // User subscriptions
  subscriptions: defineTable({
    userId: v.id("users"),
    planId: v.id("plans"),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("expired"),
      v.literal("pending")
    ),
    startDate: v.number(),
    endDate: v.number(),
    autoRenew: v.boolean(),
    dataUsed: v.number(), // in GB
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_id", ["userId"])
    .index("by_plan_id", ["planId"])
    .index("by_status", ["status"]),

  // Usage tracking
  usageHistory: defineTable({
    subscriptionId: v.id("subscriptions"),
    userId: v.id("users"),
    dataUsed: v.number(),
    date: v.number(),
    month: v.string(), // YYYY-MM format
  }).index("by_subscription", ["subscriptionId"])
    .index("by_user_month", ["userId", "month"]),

  // Discounts and offers
  discounts: defineTable({
    name: v.string(),
    description: v.string(),
    discountType: v.union(v.literal("percentage"), v.literal("fixed")),
    discountValue: v.number(),
    applicablePlans: v.array(v.id("plans")),
    startDate: v.number(),
    endDate: v.number(),
    isActive: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_active", ["isActive"]),

  // Audit logs
  auditLogs: defineTable({
    userId: v.id("users"),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    details: v.string(),
    timestamp: v.number(),
  }).index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("renewal"),
      v.literal("upgrade"),
      v.literal("offer"),
      v.literal("usage")
    ),
    isRead: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_unread", ["userId", "isRead"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
