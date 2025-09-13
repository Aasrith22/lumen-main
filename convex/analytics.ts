import { query, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const currentMonth = new Date(now).toISOString().slice(0, 7); // YYYY-MM
    const lastMonth = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7);

    // Total active subscriptions
    const activeSubscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Total plans
    const totalPlans = await ctx.db
      .query("plans")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Monthly revenue (simulated based on active subscriptions)
    let monthlyRevenue = 0;
    for (const subscription of activeSubscriptions) {
      const plan = await ctx.db.get(subscription.planId);
      if (plan) {
        monthlyRevenue += plan.price;
      }
    }

    // New subscriptions this month
    const thisMonthStart = new Date(now);
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const newSubscriptionsThisMonth = await ctx.db
      .query("subscriptions")
      .filter((q) => q.gte(q.field("createdAt"), thisMonthStart.getTime()))
      .collect();

    // Cancelled subscriptions this month
    const cancelledThisMonth = await ctx.db
      .query("subscriptions")
      .withIndex("by_status", (q) => q.eq("status", "cancelled"))
      .filter((q) => q.gte(q.field("updatedAt"), thisMonthStart.getTime()))
      .collect();

    return {
      totalActiveSubscriptions: activeSubscriptions.length,
      totalPlans: totalPlans.length,
      monthlyRevenue,
      newSubscriptionsThisMonth: newSubscriptionsThisMonth.length,
      cancelledThisMonth: cancelledThisMonth.length,
      churnRate: activeSubscriptions.length > 0 
        ? (cancelledThisMonth.length / activeSubscriptions.length) * 100 
        : 0,
    };
  },
});

export const getTopPlans = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Count subscriptions by plan
    const planCounts: Record<string, number> = {};
    for (const subscription of subscriptions) {
      const planId = subscription.planId;
      planCounts[planId] = (planCounts[planId] || 0) + 1;
    }

    // Get plan details and sort by popularity
    const planStats = await Promise.all(
      Object.entries(planCounts).map(async ([planId, count]) => {
        const plan = await ctx.db.get(planId as any);
        return {
          plan,
          subscriptionCount: count,
          revenue: plan ? (plan as any).price * count : 0,
        };
      })
    );

    return planStats
      .filter(stat => stat.plan)
      .sort((a, b) => b.subscriptionCount - a.subscriptionCount)
      .slice(0, 10);
  },
});

export const getSubscriptionTrends = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const months = [];
    
    // Get last 6 months of data
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).getTime();

      // New subscriptions in this month
      const newSubs = await ctx.db
        .query("subscriptions")
        .filter((q) => 
          q.and(
            q.gte(q.field("createdAt"), monthStart),
            q.lte(q.field("createdAt"), monthEnd)
          )
        )
        .collect();

      // Cancelled subscriptions in this month
      const cancelledSubs = await ctx.db
        .query("subscriptions")
        .withIndex("by_status", (q) => q.eq("status", "cancelled"))
        .filter((q) => 
          q.and(
            q.gte(q.field("updatedAt"), monthStart),
            q.lte(q.field("updatedAt"), monthEnd)
          )
        )
        .collect();

      months.push({
        month: monthKey,
        newSubscriptions: newSubs.length,
        cancelledSubscriptions: cancelledSubs.length,
        netGrowth: newSubs.length - cancelledSubs.length,
      });
    }

    return months;
  },
});

export const generateRecommendations = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get user's current subscription and usage
    const subscription: any = await ctx.runQuery(api.subscriptions.getUserSubscription, {});
    
    if (!subscription) {
      return {
        recommendations: ["Consider subscribing to our Fibernet Basic plan for reliable internet access."],
        reasoning: "No current subscription found.",
      };
    }

    // Get usage data
    const totalUsage: number = subscription.dataUsed || 0;
    const plan: any = subscription.plan;

    if (!plan) {
      return {
        recommendations: ["Unable to analyze your current plan. Please contact support."],
        reasoning: "Current plan information not available.",
      };
    }

    // Fallback recommendations based on usage
    const usagePercentage = (totalUsage / plan.dataQuota) * 100;
    
    let recommendations: string[] = [];
    
    if (usagePercentage > 90) {
      recommendations.push("Consider upgrading to a higher data quota plan to avoid potential overage.");
      recommendations.push("Monitor your usage more closely or consider unlimited plans.");
    } else if (usagePercentage < 30) {
      recommendations.push("You're using less than 30% of your data quota. Consider downgrading to save money.");
      recommendations.push("A lower-tier plan might better suit your usage patterns.");
    } else {
      recommendations.push("Your current plan seems well-suited to your usage patterns.");
      recommendations.push("Continue monitoring your usage to ensure optimal plan selection.");
    }

    return {
      recommendations,
      reasoning: `Based on your ${usagePercentage.toFixed(1)}% usage of your ${plan.name} plan`,
    };
  },
});
