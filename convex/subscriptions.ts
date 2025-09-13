import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const subscribe = mutation({
  args: {
    planId: v.id("plans"),
    autoRenew: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user already has an active subscription
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (existingSubscription) {
      throw new Error("User already has an active subscription");
    }

    const plan = await ctx.db.get(args.planId);
    if (!plan || !plan.isActive) {
      throw new Error("Plan not found or inactive");
    }

    const now = Date.now();
    const endDate = now + (30 * 24 * 60 * 60 * 1000); // 30 days from now

    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId,
      planId: args.planId,
      status: "active",
      startDate: now,
      endDate,
      autoRenew: args.autoRenew ?? true,
      dataUsed: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Log the action
    await ctx.db.insert("auditLogs", {
      userId,
      action: "SUBSCRIBE",
      entityType: "subscription",
      entityId: subscriptionId,
      details: `Subscribed to plan: ${plan.name}`,
      timestamp: now,
    });

    // Create notification
    await ctx.db.insert("notifications", {
      userId,
      title: "Subscription Activated",
      message: `You have successfully subscribed to ${plan.name}`,
      type: "renewal",
      isRead: false,
      createdAt: now,
    });

    return subscriptionId;
  },
});

export const upgradeSubscription = mutation({
  args: {
    newPlanId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const currentSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!currentSubscription) {
      throw new Error("No active subscription found");
    }

    const newPlan = await ctx.db.get(args.newPlanId);
    if (!newPlan || !newPlan.isActive) {
      throw new Error("New plan not found or inactive");
    }

    const currentPlan = await ctx.db.get(currentSubscription.planId);
    if (!currentPlan) {
      throw new Error("Current plan not found");
    }

    if (newPlan.price <= currentPlan.price) {
      throw new Error("New plan must be higher tier for upgrade");
    }

    // Update current subscription
    await ctx.db.patch(currentSubscription._id, {
      planId: args.newPlanId,
      updatedAt: Date.now(),
    });

    // Log the action
    await ctx.db.insert("auditLogs", {
      userId,
      action: "UPGRADE_SUBSCRIPTION",
      entityType: "subscription",
      entityId: currentSubscription._id,
      details: `Upgraded from ${currentPlan.name} to ${newPlan.name}`,
      timestamp: Date.now(),
    });

    // Create notification
    await ctx.db.insert("notifications", {
      userId,
      title: "Subscription Upgraded",
      message: `Your subscription has been upgraded to ${newPlan.name}`,
      type: "upgrade",
      isRead: false,
      createdAt: Date.now(),
    });

    return currentSubscription._id;
  },
});

export const downgradeSubscription = mutation({
  args: {
    newPlanId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const currentSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!currentSubscription) {
      throw new Error("No active subscription found");
    }

    const newPlan = await ctx.db.get(args.newPlanId);
    if (!newPlan || !newPlan.isActive) {
      throw new Error("New plan not found or inactive");
    }

    const currentPlan = await ctx.db.get(currentSubscription.planId);
    if (!currentPlan) {
      throw new Error("Current plan not found");
    }

    if (newPlan.price >= currentPlan.price) {
      throw new Error("New plan must be lower tier for downgrade");
    }

    // Update current subscription
    await ctx.db.patch(currentSubscription._id, {
      planId: args.newPlanId,
      updatedAt: Date.now(),
    });

    // Log the action
    await ctx.db.insert("auditLogs", {
      userId,
      action: "DOWNGRADE_SUBSCRIPTION",
      entityType: "subscription",
      entityId: currentSubscription._id,
      details: `Downgraded from ${currentPlan.name} to ${newPlan.name}`,
      timestamp: Date.now(),
    });

    // Create notification
    await ctx.db.insert("notifications", {
      userId,
      title: "Subscription Downgraded",
      message: `Your subscription has been downgraded to ${newPlan.name}`,
      type: "upgrade",
      isRead: false,
      createdAt: Date.now(),
    });

    return currentSubscription._id;
  },
});

export const cancelSubscription = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!subscription) {
      throw new Error("No active subscription found");
    }

    await ctx.db.patch(subscription._id, {
      status: "cancelled",
      autoRenew: false,
      updatedAt: Date.now(),
    });

    // Log the action
    await ctx.db.insert("auditLogs", {
      userId,
      action: "CANCEL_SUBSCRIPTION",
      entityType: "subscription",
      entityId: subscription._id,
      details: "Cancelled subscription",
      timestamp: Date.now(),
    });

    // Create notification
    await ctx.db.insert("notifications", {
      userId,
      title: "Subscription Cancelled",
      message: "Your subscription has been cancelled",
      type: "renewal",
      isRead: false,
      createdAt: Date.now(),
    });

    return subscription._id;
  },
});

export const renewSubscription = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .filter((q) => q.or(q.eq(q.field("status"), "cancelled"), q.eq(q.field("status"), "expired")))
      .first();

    if (!subscription) {
      throw new Error("No subscription found to renew");
    }

    const now = Date.now();
    const endDate = now + (30 * 24 * 60 * 60 * 1000); // 30 days from now

    await ctx.db.patch(subscription._id, {
      status: "active",
      startDate: now,
      endDate,
      autoRenew: true,
      updatedAt: now,
    });

    // Log the action
    await ctx.db.insert("auditLogs", {
      userId,
      action: "RENEW_SUBSCRIPTION",
      entityType: "subscription",
      entityId: subscription._id,
      details: "Renewed subscription",
      timestamp: now,
    });

    // Create notification
    await ctx.db.insert("notifications", {
      userId,
      title: "Subscription Renewed",
      message: "Your subscription has been renewed for another month",
      type: "renewal",
      isRead: false,
      createdAt: now,
    });

    return subscription._id;
  },
});

export const getUserSubscription = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    if (!subscription) {
      return null;
    }

    const plan = await ctx.db.get(subscription.planId);
    
    return {
      ...subscription,
      plan,
    };
  },
});

export const getAllSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if admin
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.role !== "admin") {
      throw new Error("Admin access required");
    }

    const subscriptions = await ctx.db.query("subscriptions").collect();
    
    const subscriptionsWithDetails = await Promise.all(
      subscriptions.map(async (subscription) => {
        const plan = await ctx.db.get(subscription.planId);
        const user = await ctx.db.get(subscription.userId);
        const userProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user_id", (q) => q.eq("userId", subscription.userId))
          .first();
        
        return {
          ...subscription,
          plan,
          user: userProfile,
        };
      })
    );

    return subscriptionsWithDetails;
  },
});
