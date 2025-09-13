import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
    .first();

  if (!profile || profile.role !== "admin") {
    throw new Error("Admin access required");
  }

  return { userId, profile };
}

export const createPlan = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    productType: v.union(v.literal("Fibernet"), v.literal("Broadband Copper")),
    price: v.number(),
    dataQuota: v.number(),
    features: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);

    const planId = await ctx.db.insert("plans", {
      ...args,
      isActive: true,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log the action
    await ctx.db.insert("auditLogs", {
      userId,
      action: "CREATE_PLAN",
      entityType: "plan",
      entityId: planId,
      details: `Created plan: ${args.name}`,
      timestamp: Date.now(),
    });

    return planId;
  },
});

export const updatePlan = mutation({
  args: {
    planId: v.id("plans"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    dataQuota: v.optional(v.number()),
    features: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);

    const { planId, ...updates } = args;
    
    await ctx.db.patch(planId, {
      ...updates,
      updatedAt: Date.now(),
    });

    // Log the action
    await ctx.db.insert("auditLogs", {
      userId,
      action: "UPDATE_PLAN",
      entityType: "plan",
      entityId: planId,
      details: `Updated plan with changes: ${JSON.stringify(updates)}`,
      timestamp: Date.now(),
    });

    return planId;
  },
});

export const deletePlan = mutation({
  args: {
    planId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);

    // Check if plan has active subscriptions
    const activeSubscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_plan_id", (q) => q.eq("planId", args.planId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    if (activeSubscriptions.length > 0) {
      throw new Error("Cannot delete plan with active subscriptions");
    }

    await ctx.db.delete(args.planId);

    // Log the action
    await ctx.db.insert("auditLogs", {
      userId,
      action: "DELETE_PLAN",
      entityType: "plan",
      entityId: args.planId,
      details: "Deleted plan",
      timestamp: Date.now(),
    });

    return args.planId;
  },
});

export const getAllPlans = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("plans")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getPlansByType = query({
  args: {
    productType: v.union(v.literal("Fibernet"), v.literal("Broadband Copper")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("plans")
      .withIndex("by_product_type", (q) => q.eq("productType", args.productType))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getAllPlansAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("plans").collect();
  },
});
