import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const createUserProfile = mutation({
  args: {
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      throw new Error("Profile already exists");
    }

    const profileId = await ctx.db.insert("userProfiles", {
      userId,
      role: args.role,
      name: args.name,
      email: user.email || "",
      phone: args.phone,
      createdAt: Date.now(),
    });

    // Log the action
    await ctx.db.insert("auditLogs", {
      userId,
      action: "CREATE_PROFILE",
      entityType: "userProfile",
      entityId: profileId,
      details: `Created profile with role: ${args.role}`,
      timestamp: Date.now(),
    });

    return profileId;
  },
});

export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    return await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();
  },
});

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    return profile?.role === "admin";
  },
});
